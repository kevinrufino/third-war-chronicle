// Draws everything: the illuminated chronicle (from the pretext typeset) and
// the little war raging on top of it. One canvas, one pass, every frame.

import { KINDS, PLAYER, type Game, type Unit } from './game'
import { visibleRange, type Typeset } from './typeset'

// Palette indices from typeset.ts → actual ink
const PALETTE = ['#2b2015', '#7f1b14', '#5a4732', '#8a671c']

const PLAYER_LABEL = 'THE KING’S BASTION'
const ENEMY_LABEL = 'THE BLACK NECROPOLIS'

const UNIT_STYLE: Record<string, { fill: string; stroke: string }> = {
  footman:     { fill: '#31538c', stroke: '#16294d' },
  archer:      { fill: '#2f6779', stroke: '#123540' },
  knight:      { fill: '#27407f', stroke: '#c9a648' },
  ghoul:       { fill: '#5f7d33', stroke: '#2c3d14' },
  gargoyle:    { fill: '#4f7157', stroke: '#22382a' },
  abomination: { fill: '#5a3260', stroke: '#2b1430' },
}

export type UiState = {
  marquee: { x0: number; y0: number; x1: number; y1: number } | null
  mouse: { x: number; y: number }
}

export function render(
  ctx: CanvasRenderingContext2D,
  ts: Typeset,
  game: Game,
  scrollY: number,
  vw: number,
  vh: number,
  ui: UiState,
  time: number,
): void {
  ctx.clearRect(0, 0, vw, vh)

  drawMarginRules(ctx, ts, vh)
  drawDecors(ctx, ts, scrollY, vh)
  drawWords(ctx, ts, scrollY, vh)

  // the war, fought upon the glass above the page
  drawSplats(ctx, game)
  drawBase(ctx, game, 0, time)
  drawBase(ctx, game, 1, time)
  for (const u of game.units) drawUnit(ctx, game, u, time)
  drawProjectiles(ctx, game)
  drawSparksAndRipples(ctx, game)
  drawMarquee(ctx, ui)
}

// ————— the page —————

function drawMarginRules(ctx: CanvasRenderingContext2D, ts: Typeset, vh: number): void {
  ctx.strokeStyle = 'rgba(127, 27, 20, 0.14)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(ts.colX - 26, 0)
  ctx.lineTo(ts.colX - 26, vh)
  ctx.moveTo(ts.colX + ts.measure + 26, 0)
  ctx.lineTo(ts.colX + ts.measure + 26, vh)
  ctx.stroke()
}

function drawDecors(ctx: CanvasRenderingContext2D, ts: Typeset, scrollY: number, vh: number): void {
  for (const d of ts.decors) {
    const sy = d.y - scrollY
    if (sy < -160 || sy > vh + 160) continue
    if (d.kind === 'ornament') {
      const half = d.w / 2
      ctx.strokeStyle = 'rgba(138, 103, 28, 0.55)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(d.x - half, sy)
      ctx.lineTo(d.x - 14, sy)
      ctx.moveTo(d.x + 14, sy)
      ctx.lineTo(d.x + half, sy)
      ctx.stroke()
      // central diamond flanked by dots
      ctx.fillStyle = '#7f1b14'
      ctx.beginPath()
      ctx.moveTo(d.x, sy - 5)
      ctx.lineTo(d.x + 5, sy)
      ctx.lineTo(d.x, sy + 5)
      ctx.lineTo(d.x - 5, sy)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgba(138, 103, 28, 0.8)'
      ctx.beginPath()
      ctx.arc(d.x - 22, sy, 1.8, 0, Math.PI * 2)
      ctx.arc(d.x + 22, sy, 1.8, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // illuminated drop cap: gold shadow-copy behind a rubric letter
      ctx.font = d.css
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = 'rgba(138, 103, 28, 0.45)'
      ctx.fillText(d.ch, d.x + 2.5, sy + 2)
      ctx.fillStyle = '#7f1b14'
      ctx.fillText(d.ch, d.x, sy)
    }
  }
}

function drawWords(ctx: CanvasRenderingContext2D, ts: Typeset, scrollY: number, vh: number): void {
  const [i0, i1] = visibleRange(ts, scrollY, vh)
  const words = ts.words
  ctx.textBaseline = 'alphabetic'
  let curF = -1
  let curC = -1
  for (let i = i0; i < i1; i++) {
    const w = words[i]!
    if (w.f !== curF) {
      curF = w.f
      ctx.font = ts.fonts[curF]!.css
    }
    if (w.c !== curC) {
      curC = w.c
      ctx.fillStyle = PALETTE[curC]!
    }
    const sy = w.y - scrollY + w.dy
    if (w.rot !== 0) {
      ctx.save()
      ctx.translate(w.x + w.dx + w.w / 2, sy)
      ctx.rotate(w.rot)
      ctx.fillText(w.text, -w.w / 2, 0)
      ctx.restore()
    } else {
      ctx.fillText(w.text, w.x + w.dx, sy)
    }
  }
}

// ————— the war —————

function drawSplats(ctx: CanvasRenderingContext2D, game: Game): void {
  for (const p of game.particles) {
    if (p.kind !== 'splat') continue
    const a = Math.min(1, p.life / (p.maxLife * 0.6)) * 0.65
    ctx.globalAlpha = a
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawBase(ctx: CanvasRenderingContext2D, game: Game, which: 0 | 1, time: number): void {
  const base = game.bases[which]!
  const player = which === 0
  const { x, y, r } = base

  // ground shadow
  ctx.fillStyle = 'rgba(35, 22, 8, 0.18)'
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.55, r * 1.25, r * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()

  if (player) {
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.2, x, y, r)
    grad.addColorStop(0, '#3c5f9e')
    grad.addColorStop(1, '#1a2c54')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#c9a648'
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(201, 166, 72, 0.6)'
    ctx.beginPath()
    ctx.arc(x, y, r - 6, 0, Math.PI * 2)
    ctx.stroke()
    // battlement ticks around the ring
    ctx.strokeStyle = '#c9a648'
    ctx.lineWidth = 3
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + time * 0.05
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2))
      ctx.lineTo(x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7))
      ctx.stroke()
    }
    ctx.fillStyle = '#e8d9b0'
    ctx.font = `${Math.round(r * 0.95)}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚜︎', x, y + 2)
  } else {
    const grad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.35, r * 0.2, x, y, r)
    grad.addColorStop(0, '#4c5f2a')
    grad.addColorStop(1, '#1e1424')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#5a3260'
    ctx.stroke()
    // jagged spikes
    ctx.fillStyle = '#2b1430'
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 - time * 0.04
      const bx = x + Math.cos(a) * r
      const by = y + Math.sin(a) * r
      const tx = x + Math.cos(a) * (r + 12 + 3 * Math.sin(time * 2 + k))
      const ty = y + Math.sin(a) * (r + 12 + 3 * Math.sin(time * 2 + k))
      const px = Math.cos(a + Math.PI / 2) * 4
      const py = Math.sin(a + Math.PI / 2) * 4
      ctx.beginPath()
      ctx.moveTo(bx - px, by - py)
      ctx.lineTo(tx, ty)
      ctx.lineTo(bx + px, by + py)
      ctx.closePath()
      ctx.fill()
    }
    ctx.fillStyle = '#9dc45e'
    ctx.font = `${Math.round(r * 0.8)}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('☠︎', x, y + 2)
  }

  // hp arc
  const frac = base.hp / base.maxHp
  if (frac < 1) {
    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(35, 22, 8, 0.25)'
    ctx.beginPath()
    ctx.arc(x, y, r + 13, -Math.PI / 2, Math.PI * 1.5)
    ctx.stroke()
    ctx.strokeStyle = frac > 0.5 ? (player ? '#c9a648' : '#7ea23c') : frac > 0.25 ? '#c07b28' : '#a03024'
    ctx.beginPath()
    ctx.arc(x, y, r + 13, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2)
    ctx.stroke()
  }

  // nameplate
  ctx.font = '600 10px "Cinzel"'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(87, 68, 48, 0.9)'
  ctx.fillText(player ? PLAYER_LABEL : ENEMY_LABEL, x, y + r + 30)
  ctx.textAlign = 'left'
}

function drawUnit(ctx: CanvasRenderingContext2D, game: Game, u: Unit, time: number): void {
  const def = KINDS[u.kind]
  const style = UNIT_STYLE[u.kind]!
  const born = Math.min(1, (game.time - u.bornAt) / 0.35)
  const r = def.radius * (0.4 + 0.6 * born)
  const wob = time * 3.1 + u.phase

  // shadow
  ctx.fillStyle = 'rgba(35, 22, 8, 0.16)'
  ctx.beginPath()
  ctx.ellipse(u.x, u.y + r * 0.75, r * 1.05, r * 0.42, 0, 0, Math.PI * 2)
  ctx.fill()

  // living ink-blob body
  ctx.beginPath()
  for (let k = 0; k <= 8; k++) {
    const a = (k / 8) * Math.PI * 2
    const rr = r * (1 + 0.14 * Math.sin(wob + k * 2.17))
    const px = u.x + Math.cos(a) * rr
    const py = u.y + Math.sin(a) * rr
    if (k === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = style.fill
  ctx.fill()
  ctx.lineWidth = u.kind === 'knight' ? 2 : 1.5
  ctx.strokeStyle = style.stroke
  ctx.stroke()

  // facing nib — a hint of a weapon
  ctx.strokeStyle = style.stroke
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(u.x + Math.cos(u.facing) * r * 0.6, u.y + Math.sin(u.facing) * r * 0.6)
  ctx.lineTo(u.x + Math.cos(u.facing) * (r + 4), u.y + Math.sin(u.facing) * (r + 4))
  ctx.stroke()

  // glint
  ctx.fillStyle = 'rgba(255, 246, 220, 0.55)'
  ctx.beginPath()
  ctx.arc(u.x - r * 0.35, u.y - r * 0.4, r * 0.22, 0, Math.PI * 2)
  ctx.fill()

  // selection ring
  if (game.selection.has(u.id)) {
    ctx.strokeStyle = '#c9a648'
    ctx.lineWidth = 1.6
    ctx.setLineDash([5, 4])
    ctx.lineDashOffset = -time * 18
    ctx.beginPath()
    ctx.arc(u.x, u.y, r + 5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // hp arc when wounded
  const frac = u.hp / def.hp
  if (frac < 1) {
    ctx.lineWidth = 2.5
    ctx.strokeStyle = 'rgba(35, 22, 8, 0.22)'
    ctx.beginPath()
    ctx.arc(u.x, u.y, r + 6, -2.35, -0.8)
    ctx.stroke()
    ctx.strokeStyle = frac > 0.5 ? '#4d7c2f' : frac > 0.25 ? '#c07b28' : '#a03024'
    ctx.beginPath()
    ctx.arc(u.x, u.y, r + 6, -2.35, -2.35 + frac * 1.55)
    ctx.stroke()
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, game: Game): void {
  for (const pr of game.projectiles) {
    const gold = pr.side === PLAYER
    ctx.strokeStyle = gold ? '#8a671c' : '#557a2a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pr.x - pr.dirX * 7, pr.y - pr.dirY * 7)
    ctx.lineTo(pr.x, pr.y)
    ctx.stroke()
    ctx.fillStyle = gold ? '#c9a648' : '#7ea23c'
    ctx.beginPath()
    ctx.arc(pr.x, pr.y, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawSparksAndRipples(ctx: CanvasRenderingContext2D, game: Game): void {
  for (const p of game.particles) {
    const t = p.life / p.maxLife
    if (p.kind === 'spark') {
      ctx.globalAlpha = t
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    } else if (p.kind === 'ripple') {
      ctx.globalAlpha = t * 0.9
      ctx.strokeStyle = p.color
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (1 + 1.6 * (1 - t)), 0, Math.PI * 2)
      ctx.stroke()
    } else if (p.kind === 'spawn') {
      ctx.globalAlpha = t * 0.8
      ctx.strokeStyle = p.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (1.8 - 0.8 * t), 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}

function drawMarquee(ctx: CanvasRenderingContext2D, ui: UiState): void {
  const m = ui.marquee
  if (m === null) return
  const x = Math.min(m.x0, m.x1)
  const y = Math.min(m.y0, m.y1)
  const w = Math.abs(m.x1 - m.x0)
  const h = Math.abs(m.y1 - m.y0)
  ctx.fillStyle = 'rgba(201, 166, 72, 0.08)'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(154, 116, 35, 0.9)'
  ctx.lineWidth = 1.2
  ctx.setLineDash([6, 4])
  ctx.strokeRect(x, y, w, h)
  ctx.setLineDash([])
}
