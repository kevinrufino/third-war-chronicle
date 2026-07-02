// The war council: gold, army, muster buttons, folio header, and the
// victory/defeat banner. Plain DOM — the only part of the UI that isn't ink.

import { armyCount, KINDS, PLAYER, SUPPLY_CAP, trainUnit, type Game, type UnitKind } from './game'
import { PLAYER_KINDS } from './game'
import type { ChapterMark } from './typeset'

export type Hud = {
  gold: HTMLElement
  army: HTMLElement
  buttons: Map<UnitKind, HTMLButtonElement>
  folioLabel: HTMLElement
  folioTitle: HTMLElement
  progressFill: HTMLElement
  banner: HTMLElement
  bannerTitle: HTMLElement
  bannerText: HTMLElement
  intro: HTMLElement
  lastFolio: string
}

function el(id: string): HTMLElement {
  const node = document.getElementById(id)
  if (node === null) throw new Error(`#${id} missing`)
  return node
}

export function initHud(handlers: { onBegin: () => void; onRestart: () => void }): Hud {
  const hud: Hud = {
    gold: el('gold-amount'),
    army: el('army-count'),
    buttons: new Map(),
    folioLabel: el('folio-label'),
    folioTitle: el('folio-title'),
    progressFill: el('progress-fill'),
    banner: el('banner'),
    bannerTitle: el('banner-title'),
    bannerText: el('banner-text'),
    intro: el('intro'),
    lastFolio: '',
  }
  for (const kind of PLAYER_KINDS) {
    hud.buttons.set(kind, el(`train-${kind}`) as HTMLButtonElement)
  }
  el('begin').addEventListener('click', () => {
    hud.intro.classList.add('hidden')
    handlers.onBegin()
  })
  el('banner-restart').addEventListener('click', () => {
    hud.banner.classList.add('hidden')
    setTimeout(() => { hud.banner.hidden = true }, 400)
    handlers.onRestart()
  })
  return hud
}

export function wireTrainButtons(hud: Hud, game: Game): void {
  for (const [kind, btn] of hud.buttons) {
    btn.addEventListener('click', () => {
      if (trainUnit(game, kind)) flashButton(hud, kind)
    })
  }
}

export function flashButton(hud: Hud, kind: string): void {
  const btn = hud.buttons.get(kind as UnitKind)
  if (btn === undefined) return
  btn.classList.remove('flash')
  void btn.offsetWidth // restart the animation
  btn.classList.add('flash')
}

export function updateHud(hud: Hud, game: Game): void {
  const gold = Math.floor(game.gold)
  const army = armyCount(game, PLAYER)
  const goldText = String(gold)
  if (hud.gold.textContent !== goldText) hud.gold.textContent = goldText
  const armyText = `${army}/${SUPPLY_CAP}`
  if (hud.army.textContent !== armyText) hud.army.textContent = armyText
  for (const [kind, btn] of hud.buttons) {
    const affordable = gold >= KINDS[kind].cost && army < SUPPLY_CAP && game.started && game.over === null
    if (btn.disabled === affordable) btn.disabled = !affordable
  }
}

export function updateFolio(hud: Hud, mark: ChapterMark | null, progress: number): void {
  const label = mark === null ? 'Folio I' : `Folio ${mark.numeral}`
  const title = mark === null ? 'The Chronicle of the Third War' : `${mark.heading} · ${mark.title}`
  const key = label + title
  if (key !== hud.lastFolio) {
    hud.lastFolio = key
    hud.folioLabel.textContent = label
    hud.folioTitle.textContent = title
  }
  hud.progressFill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`
}

export function showBanner(hud: Hud, over: 'victory' | 'defeat'): void {
  hud.banner.hidden = false
  requestAnimationFrame(() => hud.banner.classList.remove('hidden'))
  if (over === 'victory') {
    hud.bannerTitle.textContent = 'Victory'
    hud.bannerTitle.className = 'victory'
    hud.bannerText.textContent =
      'The Black Necropolis is cast down, and its ink returns to the page. Read on, commander — the chronicle keeps your deeds now.'
  } else {
    hud.bannerTitle.textContent = 'The Bastion Falls'
    hud.bannerTitle.className = ''
    hud.bannerText.textContent =
      'Your keep is thrown down and the Scourge walks the margins. Yet the tale endures — raise the banner and wage the war anew.'
  }
}
