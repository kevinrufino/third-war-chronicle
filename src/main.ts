// Boot: load the faces, let pretext set the chronicle, raise the armies,
// then run one requestAnimationFrame loop forever.

import {
  createGame,
  deployStartingForce,
  restartGame,
  resizeGame,
  updateGame,
  KINDS,
  type Game,
} from './game'
import { flashButton, initHud, showBanner, updateFolio, updateHud, wireTrainButtons } from './hud'
import { setupInput } from './input'
import { render, type UiState } from './render'
import { buildTypeset, chapterAt, updateWords, type Pusher, type Typeset } from './typeset'
import { chapters, FOREWORD, SUBTITLE, TITLE } from './story'

const canvas = document.getElementById('stage') as HTMLCanvasElement
const spacer = document.getElementById('spacer')!
const ctx = canvas.getContext('2d')!

function sizeCanvas(): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function buildA11yStory(): void {
  const article = document.getElementById('a11y-story')!
  const parts: string[] = [`<h1>${TITLE}</h1>`, `<p>${SUBTITLE}</p>`, ...FOREWORD.map(p => `<p>${p}</p>`)]
  for (const ch of chapters) {
    parts.push(`<section><h2>${ch.heading}: ${ch.title}</h2>`)
    parts.push(`<blockquote>${ch.epigraph}<br/>— ${ch.attribution}</blockquote>`)
    for (const p of ch.paragraphs) parts.push(`<p>${p}</p>`)
    parts.push('</section>')
  }
  article.innerHTML = parts.join('')
}

async function loadFonts(): Promise<void> {
  await Promise.all([
    document.fonts.load('19px "IM Fell English"'),
    document.fonts.load('italic 19px "IM Fell English"'),
    document.fonts.load('46px "UnifrakturMaguntia"'),
    document.fonts.load('600 13px "Cinzel"'),
  ])
}

function collectPushers(game: Game, ui: UiState, scrollY: number): Pusher[] {
  const pushers: Pusher[] = []
  for (const u of game.units) {
    const def = KINDS[u.kind]
    pushers.push({ x: u.x, y: u.y + scrollY, r: def.pushR, str: def.pushStr })
  }
  for (const pr of game.projectiles) {
    pushers.push({ x: pr.x, y: pr.y + scrollY, r: 30, str: 3200 })
  }
  for (const b of game.blasts) {
    pushers.push({ x: b.x, y: b.y + scrollY, r: b.r, str: b.str })
  }
  for (const base of game.bases) {
    pushers.push({ x: base.x, y: base.y + scrollY, r: base.r + 92, str: 3000 })
  }
  // the reader's quill: even the cursor stirs the ink
  pushers.push({ x: ui.mouse.x, y: ui.mouse.y + scrollY, r: 46, str: 2200 })
  return pushers
}

async function boot(): Promise<void> {
  buildA11yStory()
  await loadFonts()

  sizeCanvas()
  let ts: Typeset = buildTypeset(window.innerWidth, window.innerHeight)
  spacer.style.height = `${ts.height}px`

  const game = createGame(window.innerWidth, window.innerHeight)
  const ui: UiState = { marquee: null, mouse: { x: -9999, y: -9999 } }

  const hud = initHud({
    onBegin: () => {
      game.started = true
      deployStartingForce(game)
    },
    onRestart: () => {
      restartGame(game)
      deployStartingForce(game)
    },
  })
  wireTrainButtons(hud, game)
  setupInput(canvas, game, ui, kind => flashButton(hud, kind))

  let resizeTimer = 0
  window.addEventListener('resize', () => {
    sizeCanvas()
    resizeGame(game, window.innerWidth, window.innerHeight)
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      ts = buildTypeset(window.innerWidth, window.innerHeight)
      spacer.style.height = `${ts.height}px`
    }, 160)
  })

  let bannerShown = false
  let last = performance.now()
  let frame = 0
  const perf = { game: 0, words: 0, render: 0, frames: 0 }

  function loop(now: number): void {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
    last = now
    const scrollY = window.scrollY
    const vw = window.innerWidth
    const vh = window.innerHeight

    const t0 = performance.now()
    updateGame(game, dt)

    if (game.over !== null && !bannerShown) {
      bannerShown = true
      showBanner(hud, game.over)
    } else if (game.over === null) {
      bannerShown = false
    }

    const t1 = performance.now()
    updateWords(ts, collectPushers(game, ui, scrollY), scrollY, vh, dt)
    const t2 = performance.now()
    render(ctx, ts, game, scrollY, vw, vh, ui, now / 1000)
    const t3 = performance.now()
    perf.game += t1 - t0
    perf.words += t2 - t1
    perf.render += t3 - t2
    perf.frames++

    updateHud(hud, game)
    if (frame % 12 === 0) {
      const denom = Math.max(1, ts.height - vh)
      updateFolio(hud, chapterAt(ts, scrollY, vh), scrollY / denom)
    }
    frame++
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)

  // debug/testing hook
  ;(window as unknown as Record<string, unknown>).__chronicle = { game, getTypeset: () => ts, ui, perf }
}

void boot()
