// The page-turn. When the Chronicler reads past the foot of the open page,
// we photograph the live canvas, jump the scroll to the next passage, and
// turn the photograph over like a leaf of the codex — spine at the screen's
// edge, ink ghosting faintly through the back of the sheet.

const layer = document.getElementById('flip-layer')!
const page = document.getElementById('flip-page')!
const face = document.getElementById('flip-face') as HTMLCanvasElement

let flipping = false
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

export function isFlipping(): boolean {
  return flipping
}

function paintParchment(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // approximate the body's parchment so the turning leaf reads as solid paper
  const g = ctx.createLinearGradient(0, 0, w * 0.35, h)
  g.addColorStop(0, '#efe4ca')
  g.addColorStop(0.55, '#ead9b7')
  g.addColorStop(1, '#e2d2ac')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const glow = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.9)
  glow.addColorStop(0, 'rgba(255, 250, 235, 0.5)')
  glow.addColorStop(1, 'rgba(255, 250, 235, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
}

// Turn the page: `dir` 1 flips forward (spine left), -1 flips back (spine
// right). Returns false when a flip is already in flight.
export function flipTo(stage: HTMLCanvasElement, targetY: number, dir: 1 | -1): boolean {
  if (flipping) return false
  const top = Math.max(0, Math.round(targetY))

  if (reduced.matches) {
    window.scrollTo({ top, behavior: 'smooth' })
    return true
  }
  flipping = true

  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = Math.min(1.5, window.devicePixelRatio || 1)
  face.width = Math.round(w * dpr)
  face.height = Math.round(h * dpr)
  const fctx = face.getContext('2d')!
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  paintParchment(fctx, w, h)
  fctx.drawImage(stage, 0, 0, stage.width, stage.height, 0, 0, w, h)

  layer.hidden = false
  layer.classList.toggle('backward', dir === -1)

  // the new passage appears beneath while the old page turns over it
  window.scrollTo({ top, behavior: 'auto' })

  layer.classList.remove('turning')
  void page.offsetWidth // restart the animation
  layer.classList.add('turning')

  let done = false
  const finish = (): void => {
    if (done) return
    done = true
    layer.classList.remove('turning')
    layer.hidden = true
    flipping = false
    page.removeEventListener('animationend', onEnd)
  }
  const onEnd = (e: AnimationEvent): void => {
    if (e.animationName === 'page-fwd' || e.animationName === 'page-back') finish()
  }
  page.addEventListener('animationend', onEnd)
  window.setTimeout(finish, 1700) // safety: never leave a page hanging mid-air
  return true
}
