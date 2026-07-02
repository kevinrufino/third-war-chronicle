// Classic RTS controls on top of a scrolling page: left-drag marquee,
// left-click select, right-click move/attack, 1/2/3 train, F select-all.
// The wheel is left alone — scrolling the page IS the camera.

import {
  issueCommand,
  selectAll,
  selectAt,
  selectRect,
  trainUnit,
  PLAYER_KINDS,
  type Game,
} from './game'
import type { UiState } from './render'

const DRAG_THRESHOLD = 5

export function setupInput(
  canvas: HTMLCanvasElement,
  game: Game,
  ui: UiState,
  onTrained: (kind: string) => void,
): void {
  let downAt: { x: number; y: number } | null = null

  canvas.addEventListener('contextmenu', e => e.preventDefault())

  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return // touch handled on pointerup as a tap
    if (e.button === 0) {
      downAt = { x: e.clientX, y: e.clientY }
      ui.marquee = { x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY }
      canvas.setPointerCapture(e.pointerId)
    } else if (e.button === 2) {
      issueCommand(game, e.clientX, e.clientY)
    }
  })

  canvas.addEventListener('pointermove', e => {
    ui.mouse.x = e.clientX
    ui.mouse.y = e.clientY
    if (ui.marquee !== null) {
      ui.marquee.x1 = e.clientX
      ui.marquee.y1 = e.clientY
    }
  })

  canvas.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch') {
      // tap: rally everyone and send them — a one-finger war
      selectAll(game)
      issueCommand(game, e.clientX, e.clientY)
      return
    }
    if (e.button !== 0) return
    if (downAt !== null) {
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y)
      if (moved < DRAG_THRESHOLD) {
        selectAt(game, e.clientX, e.clientY, e.shiftKey)
      } else {
        selectRect(game, downAt.x, downAt.y, e.clientX, e.clientY, e.shiftKey)
      }
    }
    downAt = null
    ui.marquee = null
  })

  canvas.addEventListener('pointercancel', () => {
    downAt = null
    ui.marquee = null
  })

  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const kindIndex = ['1', '2', '3'].indexOf(e.key)
    if (kindIndex !== -1) {
      const kind = PLAYER_KINDS[kindIndex]!
      if (trainUnit(game, kind)) onTrained(kind)
      return
    }
    if (e.key === 'f' || e.key === 'F') {
      selectAll(game)
    } else if (e.key === 'Escape') {
      game.selection.clear()
    }
  })
}
