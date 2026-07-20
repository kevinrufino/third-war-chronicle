// The Chronicler — an audiobook narrator for the chronicle, built on the
// browser's own speech engine (Web Speech API): no assets, no keys, no server.
//
// Word-level sync: where the engine reports word boundaries we snap the
// highlight to them; where it does not (or where no voice exists at all) a
// reading-pace estimator carries the highlight, so the page always follows
// the telling. The narrator never scrolls the page itself — it asks main.ts
// for a page-flip whenever the spoken word walks off the open page.

import type { NarrationSegment, SegKind, Typeset } from './typeset'

export type NarrationView = {
  word: number // word index currently being spoken, -1 when idle
  attack: number // 0→1 ease-in of the current word's glow
  glow: Map<number, number> // recently spoken words → fading intensity
  lampX: number // lamplight position, document space
  lampY: number
  lampA: number // lamplight strength 0..1
}

export type Narrator = {
  supported: boolean
  view: NarrationView
  playing: boolean
  everStarted: boolean
  silent: boolean
  follow: boolean
  speaking: () => boolean
  start: (fromSegment: number) => void
  startAtViewport: (scrollY: number, vh: number) => void
  toggle: (scrollY: number, vh: number) => void
  pause: () => void
  resume: () => void
  nextChapter: () => void
  prevChapter: () => void
  currentChapter: () => number
  refollow: () => void
  setFollow: (follow: boolean) => void
  voices: () => SpeechSynthesisVoice[]
  voiceURI: () => string | null
  setVoice: (uri: string) => void
  rate: () => number
  setRate: (rate: number) => void
  onState: (listener: () => void) => void
  tick: (now: number, scrollY: number, vh: number, dt: number) => void
}

export type NarratorOpts = {
  getTypeset: () => Typeset
  requestFlip: (targetY: number, dir: 1 | -1) => boolean
}

// Silence between segments, keyed by the segment that just ended.
const GAP_AFTER: Record<SegKind, number> = {
  title: 750,
  subtitle: 650,
  foreword: 650,
  heading: 380,
  chtitle: 600,
  epigraph: 420,
  attribution: 950,
  para: 480,
  colophon: 600,
}
const GAP_BEFORE_CHAPTER = 900 // extra breath before a new chapter's heading

// Spoken characters per second at rate 1 — used by the estimator fallback
// and the watchdog that keeps the telling moving when the engine goes quiet.
const CHARS_PER_SEC = 15

const VOICE_KEY = 'chronicle.voice'
const RATE_KEY = 'chronicle.rate'

// Voices that sound like a chronicler. Higher is better.
function voiceScore(v: SpeechSynthesisVoice): number {
  let s = 0
  const name = v.name
  if (/^en[-_]GB/i.test(v.lang)) s += 5
  else if (/^en[-_](IE|AU|SC)/i.test(v.lang)) s += 2
  else if (/^en/i.test(v.lang)) s += 1
  if (/Google UK English Male/i.test(name)) s += 9
  if (/\bDaniel\b/i.test(name)) s += 8
  if (/\b(Ryan|George)\b/i.test(name)) s += 7
  if (/\bArthur\b/i.test(name)) s += 6
  if (/\b(Oliver|Brian|Guy)\b/i.test(name)) s += 5
  if (/\bJames\b/i.test(name)) s += 4
  if (/natural|neural|online/i.test(name)) s += 3
  if (v.localService) s += 1
  if (/female/i.test(name)) s -= 4
  return s
}

export function createNarrator(opts: NarratorOpts): Narrator {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const synth = supported ? window.speechSynthesis : null
  const chromium = typeof window !== 'undefined' && 'chrome' in window

  const view: NarrationView = { word: -1, attack: 0, glow: new Map(), lampX: 0, lampY: -9999, lampA: 0 }

  // UI listener (the Chronicler's dock) — bound after creation via onState
  let listener: () => void = () => {}
  const emit = (): void => listener()

  // Position in the chronicle
  let segIndex = 0
  let tokenIndex = 0 // token within the current segment's spoken tokens
  let tokens: string[] = []
  let offs: number[] = [] // char offset of each token in the segment's spoken text

  // State of the current utterance
  let utter: SpeechSynthesisUtterance | null = null // held to dodge Chrome's GC-drops-events bug
  let utterBase = 0 // token index the current utterance started from
  let started = false // the engine actually began voicing
  let boundarySeen = false // the engine reports word boundaries
  let generation = 0 // stale-utterance guard: events from a superseded utterance are ignored
  let estStart = 0 // ms timestamp the utterance (or its estimate) began
  let estDurMs = 0
  let waitingGap = false
  let gapTimer = 0
  let keepAlive = 0

  let chosenVoice: SpeechSynthesisVoice | null = null
  let savedVoiceURI: string | null = null
  let speechRate = 0.93
  try {
    savedVoiceURI = localStorage.getItem(VOICE_KEY)
    const r = localStorage.getItem(RATE_KEY)
    if (r !== null) speechRate = Math.min(1.3, Math.max(0.6, parseFloat(r) || 0.93))
  } catch { /* storage may be unavailable */ }

  let sortedVoices: SpeechSynthesisVoice[] = []

  function refreshVoices(): void {
    if (synth === null) return
    const all = synth.getVoices().filter(v => /^en/i.test(v.lang))
    all.sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name))
    sortedVoices = all
    const saved = savedVoiceURI === null ? undefined : all.find(v => v.voiceURI === savedVoiceURI)
    chosenVoice = saved ?? all[0] ?? null
    emit()
  }
  if (synth !== null) {
    refreshVoices()
    synth.addEventListener('voiceschanged', refreshVoices)
  }

  function segments(): NarrationSegment[] {
    return opts.getTypeset().narration
  }

  function currentSeg(): NarrationSegment | null {
    return segments()[segIndex] ?? null
  }

  // Spoken token → laid word. Mostly 1:1, but pretext hyphen-breaks compound
  // words at line ends ("plague-born" → "plague-" + "born"), so a token can
  // span several word particles — and the splits move with viewport width,
  // which is why the map is rebuilt whenever the typeset is.
  let tokenWord: Int32Array = new Int32Array(0)
  let mapTs: Typeset | null = null

  function buildTokenMap(): void {
    const ts = opts.getTypeset()
    mapTs = ts
    const seg = currentSeg()
    tokenWord = new Int32Array(tokens.length)
    if (seg === null) return
    let wi = seg.start + seg.lead
    for (let k = 0; k < tokens.length; k++) {
      tokenWord[k] = Math.min(wi, seg.end - 1)
      const t = tokens[k]!
      let consumed = wi < seg.end ? ts.words[wi]!.text.length : t.length
      wi++
      // a drop cap steals the first letter of a paragraph's first word
      const want = k === 0 && seg.kind === 'para' ? t.length - 1 : t.length
      while (wi < seg.end && consumed < want) {
        consumed += ts.words[wi]!.text.length
        wi++
      }
    }
  }

  function ensureMap(): void {
    if (mapTs !== opts.getTypeset()) buildTokenMap()
  }

  function wordOf(token: number): number {
    const seg = currentSeg()
    if (seg === null) return -1
    ensureMap()
    const k = Math.min(Math.max(0, token), tokenWord.length - 1)
    return tokenWord.length === 0 ? seg.start : tokenWord[k]!
  }

  // every laid word this token covers (hyphen splits included)
  function glowToken(token: number): void {
    const seg = currentSeg()
    if (seg === null || tokenWord.length === 0) return
    ensureMap()
    const a = wordOf(token)
    const b = token + 1 < tokenWord.length ? tokenWord[token + 1]! : seg.end
    for (let wi = a; wi < b; wi++) view.glow.set(wi, 1)
  }

  function clearTimers(): void {
    if (gapTimer !== 0) { window.clearTimeout(gapTimer); gapTimer = 0 }
    if (keepAlive !== 0) { window.clearInterval(keepAlive); keepAlive = 0 }
  }

  function cancelUtterance(): void {
    generation++
    if (keepAlive !== 0) { window.clearInterval(keepAlive); keepAlive = 0 }
    utter = null
    synth?.cancel()
  }

  function setToken(k: number): void {
    if (k <= tokenIndex) return
    for (let j = tokenIndex; j < k; j++) glowToken(j)
    tokenIndex = k
    view.attack = 0
    view.word = wordOf(tokenIndex)
  }

  function tokenFromChar(base: number, charInSlice: number): number {
    const baseOff = offs[base] ?? 0
    let k = base
    while (k + 1 < tokens.length && (offs[k + 1] ?? Infinity) - baseOff <= charInSlice) k++
    return k
  }

  function prepareSegment(): void {
    const seg = currentSeg()
    tokens = seg === null ? [] : seg.text.split(' ').filter(t => t.length > 0)
    offs = new Array<number>(tokens.length)
    let o = 0
    for (let i = 0; i < tokens.length; i++) {
      offs[i] = o
      o += tokens[i]!.length + 1
    }
    buildTokenMap()
  }

  function speakFrom(base: number): void {
    const seg = currentSeg()
    if (seg === null) { finishAll(); return }
    utterBase = base
    started = false
    boundarySeen = false
    estStart = performance.now()
    const sliceText = tokens.slice(base).join(' ')
    estDurMs = (sliceText.length / (CHARS_PER_SEC * speechRate)) * 1000
    const gen = ++generation

    if (synth === null || sliceText.length === 0) return // estimator carries it

    const u = new SpeechSynthesisUtterance(sliceText)
    if (chosenVoice !== null) u.voice = chosenVoice
    u.rate = speechRate
    u.pitch = 0.82
    u.onstart = () => {
      if (gen !== generation) return
      started = true
      estStart = performance.now() // re-anchor: engines warm up slowly
      if (narrator.silent) { narrator.silent = false; emit() }
      if (chromium && keepAlive === 0) {
        // Chromium stalls long utterances on remote voices unless nudged
        keepAlive = window.setInterval(() => {
          if (synth.speaking && !synth.paused) { synth.pause(); synth.resume() }
        }, 12000)
      }
      emit()
    }
    u.onboundary = e => {
      if (gen !== generation) return
      if (e.name !== undefined && e.name !== '' && e.name !== 'word') return
      boundarySeen = true
      setToken(tokenFromChar(utterBase, e.charIndex))
    }
    const settle = (): void => {
      if (gen !== generation) return
      if (!started) {
        // the engine refused the utterance (no voices, no backend): fall to
        // silent mode and let the estimator finish the segment at reading pace
        if (!narrator.silent) { narrator.silent = true; emit() }
        utter = null
        return
      }
      segmentDone()
    }
    u.onend = settle
    u.onerror = settle
    utter = u
    synth.speak(u)
  }

  function segmentDone(): void {
    if (keepAlive !== 0) { window.clearInterval(keepAlive); keepAlive = 0 }
    utter = null
    generation++
    setToken(Math.max(tokenIndex, tokens.length - 1))
    if (tokens.length > 0) glowToken(tokens.length - 1)

    const segs = segments()
    const cur = segs[segIndex]
    const next = segs[segIndex + 1]
    let gap = cur === undefined ? 500 : GAP_AFTER[cur.kind]
    if (next !== undefined && next.kind === 'heading') gap += GAP_BEFORE_CHAPTER

    waitingGap = true
    gapTimer = window.setTimeout(() => {
      gapTimer = 0
      waitingGap = false
      segIndex++
      if (segIndex >= segments().length) finishAll()
      else beginSegment()
    }, gap)
  }

  function beginSegment(): void {
    tokenIndex = 0
    prepareSegment()
    view.attack = 0
    view.word = wordOf(0)
    speakFrom(0)
    emit()
  }

  function finishAll(): void {
    narrator.playing = false
    waitingGap = false
    clearTimers()
    cancelUtterance()
    emit()
  }

  function jumpTo(seg: number): void {
    const wasPlaying = narrator.playing
    clearTimers()
    cancelUtterance()
    waitingGap = false
    segIndex = Math.min(Math.max(0, seg), Math.max(0, segments().length - 1))
    tokenIndex = 0
    prepareSegment()
    view.attack = 0
    view.word = wordOf(0)
    narrator.follow = true
    narrator.everStarted = true
    lastFlipAt = 0
    if (wasPlaying) speakFrom(0)
    emit()
  }

  function headingIndices(): number[] {
    const out: number[] = []
    const segs = segments()
    for (let i = 0; i < segs.length; i++) if (segs[i]!.kind === 'heading') out.push(i)
    return out
  }

  let lastFlipAt = 0

  const narrator: Narrator = {
    supported,
    view,
    playing: false,
    everStarted: false,
    silent: false,
    follow: true,

    speaking: () => narrator.playing && started && !narrator.silent && utter !== null,

    start(fromSegment: number): void {
      if (!supported) return
      clearTimers()
      cancelUtterance()
      waitingGap = false
      narrator.playing = true
      narrator.everStarted = true
      narrator.follow = true
      narrator.silent = false
      lastFlipAt = 0
      segIndex = Math.min(Math.max(0, fromSegment), Math.max(0, segments().length - 1))
      beginSegment()
    },

    startAtViewport(scrollY: number, vh: number): void {
      const ts = opts.getTypeset()
      const segs = ts.narration
      const probe = scrollY + Math.min(220, vh * 0.3)
      let pick = 0
      for (let i = 0; i < segs.length; i++) {
        const first = ts.words[segs[i]!.start]
        if (first !== undefined && first.y <= probe) pick = i
        else if (first !== undefined && first.y > probe) break
      }
      narrator.start(pick)
    },

    toggle(scrollY: number, vh: number): void {
      if (!supported) return
      if (narrator.playing) narrator.pause()
      else if (narrator.everStarted) narrator.resume()
      else narrator.startAtViewport(scrollY, vh)
    },

    pause(): void {
      if (!narrator.playing) return
      narrator.playing = false
      if (waitingGap) {
        // paused in the silence between segments: resume at the next one
        waitingGap = false
        if (gapTimer !== 0) { window.clearTimeout(gapTimer); gapTimer = 0 }
        if (segIndex < segments().length - 1) { segIndex++; tokenIndex = 0; prepareSegment() }
      }
      clearTimers()
      cancelUtterance()
      emit()
    },

    resume(): void {
      if (narrator.playing || !narrator.everStarted) return
      if (segIndex >= segments().length) { narrator.start(0); return }
      narrator.playing = true
      prepareSegment()
      speakFrom(tokenIndex)
      emit()
    },

    nextChapter(): void {
      const heads = headingIndices()
      const next = heads.find(h => h > segIndex)
      if (next !== undefined) jumpTo(next)
    },

    prevChapter(): void {
      const heads = headingIndices()
      let cur = -1
      for (const h of heads) { if (h <= segIndex) cur = h; else break }
      if (cur === -1) { jumpTo(0); return }
      // deep into a chapter → its start; at its start → the one before
      if (segIndex > cur) jumpTo(cur)
      else {
        const prevHead = heads.filter(h => h < cur).pop()
        jumpTo(prevHead ?? 0)
      }
    },

    currentChapter(): number {
      const seg = segments()[Math.min(segIndex, Math.max(0, segments().length - 1))]
      return seg === undefined ? -1 : seg.chapter
    },

    refollow(): void {
      narrator.follow = true
      lastFlipAt = 0
      emit()
    },

    setFollow(follow: boolean): void {
      if (narrator.follow === follow) return
      narrator.follow = follow
      emit()
    },

    voices: () => sortedVoices,
    voiceURI: () => (chosenVoice === null ? null : chosenVoice.voiceURI),

    setVoice(uri: string): void {
      const v = sortedVoices.find(x => x.voiceURI === uri)
      if (v === undefined) return
      chosenVoice = v
      savedVoiceURI = uri
      try { localStorage.setItem(VOICE_KEY, uri) } catch { /* ignore */ }
      if (narrator.playing) { cancelUtterance(); prepareSegment(); speakFrom(tokenIndex) }
      emit()
    },

    rate: () => speechRate,

    setRate(rate: number): void {
      speechRate = Math.min(1.3, Math.max(0.6, rate))
      try { localStorage.setItem(RATE_KEY, String(speechRate)) } catch { /* ignore */ }
      if (narrator.playing) { cancelUtterance(); prepareSegment(); speakFrom(tokenIndex) }
      emit()
    },

    onState(fn: () => void): void {
      listener = fn
    },

    tick(now: number, scrollY: number, vh: number, dt: number): void {
      // fade the karaoke trail
      if (view.glow.size > 0) {
        const f = Math.exp(-dt * 1.35)
        for (const [i, g] of view.glow) {
          const ng = g * f
          if (ng < 0.04) view.glow.delete(i)
          else view.glow.set(i, ng)
        }
      }

      const seg = currentSeg()
      const active = narrator.playing && !waitingGap && seg !== null && tokens.length > 0

      if (active) {
        const elapsed = now - estStart

        // estimator: carries the highlight when the engine is mute or terse
        if (!boundarySeen) {
          const estChars = (elapsed / 1000) * CHARS_PER_SEC * speechRate
          setToken(tokenFromChar(utterBase, estChars))
        }

        // watchdogs: never let a stalled engine stall the telling
        if (!started && !narrator.silent && elapsed > 2600) {
          narrator.silent = true
          emit()
        }
        const deadline = !started
          ? estDurMs + 400
          : boundarySeen
            ? estDurMs * 3 + 10000
            : estDurMs * 1.75 + 3000
        if (elapsed > deadline) {
          cancelUtterance()
          segmentDone()
        }
      }

      // ease the current word's glow in
      if (view.word >= 0) view.attack = Math.min(1, view.attack + dt * 7)

      // lamplight follows the spoken word like a candle carried along the page
      const ts = opts.getTypeset()
      const w = view.word >= 0 ? ts.words[view.word] : undefined
      if (w !== undefined) {
        const tx = w.x + w.w / 2
        const ty = w.y - ts.fonts[w.f]!.size * 0.3
        if (Math.abs(ty - view.lampY) > vh) {
          view.lampX = tx
          view.lampY = ty
        } else {
          const k = Math.min(1, dt * 7)
          view.lampX += (tx - view.lampX) * k
          view.lampY += (ty - view.lampY) * k
        }
      }
      const lampTarget = narrator.playing ? 1 : 0
      view.lampA += (lampTarget - view.lampA) * Math.min(1, dt * 3)

      // page-flip: when the spoken word walks off the open page, turn it
      if (narrator.playing && narrator.follow && w !== undefined && now - lastFlipAt > 900) {
        const sy = w.y - scrollY
        const below = sy > vh - 185
        const above = sy < 16
        if (below || above) {
          const target = Math.min(
            Math.max(0, w.y - Math.max(110, vh * 0.15)),
            Math.max(0, ts.height - vh),
          )
          if (opts.requestFlip(target, above ? -1 : 1)) lastFlipAt = now
        }
      }
    },
  }

  return narrator
}
