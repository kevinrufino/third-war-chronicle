// The Chronicler's lectern: the little dock that commands the narration.
// Plain DOM, like the war council — play/pause ring, chapter skips, a choice
// of voice and cadence, and the "return to the telling" pill for readers who
// wander off mid-sentence.

import type { Narrator } from './narration'
import { chapters } from './story'

export function initChronicler(narr: Narrator): void {
  const dock = document.getElementById('chronicler')!
  const beginVoiced = document.getElementById('begin-voiced')

  if (!narr.supported) {
    dock.remove()
    beginVoiced?.remove()
    document.getElementById('return-pill')?.remove()
    // the silent begin becomes the only (and therefore primary) way in
    const begin = document.getElementById('begin')
    if (begin !== null) {
      begin.className = 'begin-primary'
      begin.textContent = '⚜ Begin the Chronicle ⚜'
    }
    return
  }

  const toggleBtn = document.getElementById('narr-toggle') as HTMLButtonElement
  const prevBtn = document.getElementById('narr-prev') as HTMLButtonElement
  const nextBtn = document.getElementById('narr-next') as HTMLButtonElement
  const chapterLabel = document.getElementById('narr-chapter')!
  const voiceSelect = document.getElementById('narr-voice') as HTMLSelectElement
  const tempoSelect = document.getElementById('narr-tempo') as HTMLSelectElement
  const muteNote = document.getElementById('narr-mute-note')!
  const pill = document.getElementById('return-pill') as HTMLButtonElement

  dock.hidden = false

  toggleBtn.addEventListener('click', () => narr.toggle(window.scrollY, window.innerHeight))
  prevBtn.addEventListener('click', () => narr.prevChapter())
  nextBtn.addEventListener('click', () => narr.nextChapter())
  pill.addEventListener('click', () => narr.refollow())

  voiceSelect.addEventListener('change', () => narr.setVoice(voiceSelect.value))
  tempoSelect.addEventListener('change', () => narr.setRate(parseFloat(tempoSelect.value)))

  // pick the tempo option closest to the persisted rate
  {
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < tempoSelect.options.length; i++) {
      const d = Math.abs(parseFloat(tempoSelect.options[i]!.value) - narr.rate())
      if (d < bestDist) { bestDist = d; best = i }
    }
    tempoSelect.selectedIndex = best
  }

  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
    const t = e.target
    if (t instanceof HTMLElement && (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
    if (e.key === 'n' || e.key === 'N') narr.toggle(window.scrollY, window.innerHeight)
  })

  // reading ahead (or back) by hand parts company with the telling — the
  // pill offers the way home
  const disengage = (): void => {
    if (narr.playing && narr.follow) narr.setFollow(false)
  }
  window.addEventListener('wheel', disengage, { passive: true })
  window.addEventListener('touchmove', disengage, { passive: true })
  window.addEventListener('keydown', e => {
    if (['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) disengage()
  })

  let voiceCount = -1

  const sync = (): void => {
    dock.classList.toggle('playing', narr.playing)
    dock.classList.toggle('speaking', narr.speaking())
    dock.classList.toggle('mute', narr.silent)
    toggleBtn.setAttribute('aria-pressed', narr.playing ? 'true' : 'false')
    toggleBtn.title = narr.playing ? 'Hush the Chronicler · N' : 'The Chronicler reads aloud · N'
    muteNote.hidden = !narr.silent

    const c = narr.currentChapter()
    const label = c < 0 ? 'The Chronicle' : chapters[c]?.heading ?? 'The Chronicle'
    if (chapterLabel.textContent !== label) chapterLabel.textContent = label

    pill.hidden = !(narr.playing && !narr.follow)

    const voices = narr.voices()
    if (voices.length !== voiceCount) {
      voiceCount = voices.length
      voiceSelect.textContent = ''
      for (const v of voices) {
        const opt = document.createElement('option')
        opt.value = v.voiceURI
        opt.textContent = v.name
        voiceSelect.appendChild(opt)
      }
    }
    const uri = narr.voiceURI()
    if (uri !== null && voiceSelect.value !== uri) voiceSelect.value = uri
  }

  narr.onState(sync)
  sync()
}
