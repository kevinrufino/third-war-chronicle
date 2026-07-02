// The war itself: units, bases, gold, combat, and the Scourge's wave AI.
// Everything lives in screen space — the armies fight "on the glass" while
// the chronicle scrolls beneath them.

export const PLAYER = 0
export const ENEMY = 1
export type Side = 0 | 1

export type UnitKind = 'footman' | 'archer' | 'knight' | 'ghoul' | 'gargoyle' | 'abomination'

export type KindDef = {
  name: string
  hp: number
  dmg: number
  range: number // 0 = melee
  cooldown: number
  speed: number
  radius: number
  aggro: number
  pushR: number // how widely this unit shoves words aside
  pushStr: number
  cost: number
  projectileSpeed?: number
}

export const KINDS: Record<UnitKind, KindDef> = {
  footman:     { name: 'Footman',     hp: 75,  dmg: 9,  range: 0,   cooldown: 0.75, speed: 96,  radius: 8,  aggro: 150, pushR: 56, pushStr: 5200,  cost: 50 },
  archer:      { name: 'Archer',      hp: 44,  dmg: 7,  range: 128, cooldown: 0.95, speed: 88,  radius: 7,  aggro: 175, pushR: 50, pushStr: 4600,  cost: 75,  projectileSpeed: 340 },
  knight:      { name: 'Knight',      hp: 160, dmg: 16, range: 0,   cooldown: 1.05, speed: 80,  radius: 11, aggro: 150, pushR: 74, pushStr: 7200,  cost: 140 },
  ghoul:       { name: 'Ghoul',       hp: 58,  dmg: 8,  range: 0,   cooldown: 0.65, speed: 104, radius: 8,  aggro: 165, pushR: 56, pushStr: 5200,  cost: 45 },
  gargoyle:    { name: 'Gargoyle',    hp: 42,  dmg: 6,  range: 118, cooldown: 0.85, speed: 98,  radius: 7,  aggro: 175, pushR: 50, pushStr: 4600,  cost: 70 },
  abomination: { name: 'Abomination', hp: 185, dmg: 17, range: 0,   cooldown: 1.2,  speed: 62,  radius: 13, aggro: 150, pushR: 82, pushStr: 8200,  cost: 150 },
}

export const PLAYER_KINDS: UnitKind[] = ['footman', 'archer', 'knight']
export const SUPPLY_CAP = 40

export type Order =
  | { type: 'idle' }
  | { type: 'move'; x: number; y: number }
  | { type: 'attackmove'; x: number; y: number }
  | { type: 'attack'; targetId: number }

export type Unit = {
  id: number
  side: Side
  kind: UnitKind
  x: number
  y: number
  hp: number
  cd: number
  order: Order
  phase: number // per-unit wobble phase for the ink-blob outline
  facing: number
  bornAt: number
}

export type Base = {
  id: number
  side: Side
  x: number
  y: number
  r: number
  hp: number
  maxHp: number
}

export type Projectile = {
  x: number
  y: number
  dirX: number
  dirY: number
  side: Side
  dmg: number
  targetId: number
  speed: number
  dead: boolean
}

export type Particle = {
  kind: 'splat' | 'spark' | 'ripple' | 'spawn'
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export type Blast = { x: number; y: number; r: number; str: number; life: number }

export type GameOver = 'victory' | 'defeat' | null

export type Game = {
  vw: number
  vh: number
  units: Unit[]
  bases: [Base, Base] // [player, enemy]
  projectiles: Projectile[]
  particles: Particle[]
  blasts: Blast[]
  selection: Set<number>
  gold: number
  time: number
  started: boolean
  over: GameOver
  // enemy AI
  enemyGold: number
  waveSize: number
  aiAttacking: boolean
  grace: number
}

const BASE_HP = 1400
export const PLAYER_BASE_ID = 1_000_000
export const ENEMY_BASE_ID = 1_000_001

let nextId = 1

const INK_SPLAT = '#241a10'
const PLAYER_SPARK = '#c9a648'
const ENEMY_SPARK = '#7ea23c'

export function createGame(vw: number, vh: number): Game {
  const game: Game = {
    vw,
    vh,
    units: [],
    bases: [
      { id: PLAYER_BASE_ID, side: PLAYER, x: 0, y: 0, r: 42, hp: BASE_HP, maxHp: BASE_HP },
      { id: ENEMY_BASE_ID, side: ENEMY, x: 0, y: 0, r: 42, hp: BASE_HP, maxHp: BASE_HP },
    ],
    projectiles: [],
    particles: [],
    blasts: [],
    selection: new Set(),
    gold: 125,
    time: 0,
    started: false,
    over: null,
    enemyGold: 0,
    waveSize: 4,
    aiAttacking: false,
    grace: 20,
  }
  resizeGame(game, vw, vh)
  return game
}

export function resizeGame(game: Game, vw: number, vh: number): void {
  game.vw = vw
  game.vh = vh
  const inset = Math.min(120, vw * 0.11)
  game.bases[0].x = inset
  game.bases[0].y = vh - inset - 30
  game.bases[1].x = vw - inset
  game.bases[1].y = inset + 20
  for (const u of game.units) {
    u.x = Math.min(Math.max(u.x, 10), vw - 10)
    u.y = Math.min(Math.max(u.y, 10), vh - 10)
  }
}

export function restartGame(game: Game): void {
  game.units.length = 0
  game.projectiles.length = 0
  game.particles.length = 0
  game.blasts.length = 0
  game.selection.clear()
  game.gold = 125
  game.time = 0
  game.over = null
  game.enemyGold = 0
  game.waveSize = 4
  game.aiAttacking = false
  game.grace = 20
  game.bases[0].hp = game.bases[0].maxHp
  game.bases[1].hp = game.bases[1].maxHp
}

// ————— targets (units and bases share an interface) —————

type Target = { id: number; x: number; y: number; radius: number; side: Side }

function findTarget(game: Game, id: number): Target | null {
  if (id === PLAYER_BASE_ID || id === ENEMY_BASE_ID) {
    const base = game.bases[id === PLAYER_BASE_ID ? 0 : 1]
    return base.hp > 0 ? { id, x: base.x, y: base.y, radius: base.r, side: base.side } : null
  }
  for (const u of game.units) {
    if (u.id === id && u.hp > 0) return { id, x: u.x, y: u.y, radius: KINDS[u.kind].radius, side: u.side }
  }
  return null
}

function nearestEnemy(game: Game, unit: Unit, radius: number): Target | null {
  let best: Target | null = null
  let bestD = radius
  for (const other of game.units) {
    if (other.side === unit.side || other.hp <= 0) continue
    const d = Math.hypot(other.x - unit.x, other.y - unit.y) - KINDS[other.kind].radius
    if (d < bestD) {
      bestD = d
      best = { id: other.id, x: other.x, y: other.y, radius: KINDS[other.kind].radius, side: other.side }
    }
  }
  const enemyBase = game.bases[unit.side === PLAYER ? 1 : 0]
  const bd = Math.hypot(enemyBase.x - unit.x, enemyBase.y - unit.y) - enemyBase.r
  if (bd < bestD && enemyBase.hp > 0) {
    best = { id: enemyBase.id, x: enemyBase.x, y: enemyBase.y, radius: enemyBase.r, side: enemyBase.side }
  }
  return best
}

// ————— spawning & commands —————

function spawnUnit(game: Game, side: Side, kind: UnitKind): Unit {
  const base = game.bases[side]
  const toward = side === PLAYER ? -Math.PI / 4 : (3 * Math.PI) / 4 // rally toward page center
  const ang = toward + (Math.random() - 0.5) * 1.4
  const dist = base.r + 22 + Math.random() * 26
  const unit: Unit = {
    id: nextId++,
    side,
    kind,
    x: base.x + Math.cos(ang) * dist,
    y: base.y + Math.sin(ang) * dist,
    hp: KINDS[kind].hp,
    cd: 0,
    order: { type: 'idle' },
    phase: Math.random() * Math.PI * 2,
    facing: ang,
    bornAt: game.time,
  }
  game.units.push(unit)
  game.particles.push({
    kind: 'spawn', x: unit.x, y: unit.y, vx: 0, vy: 0,
    life: 0.5, maxLife: 0.5, size: KINDS[kind].radius + 16,
    color: side === PLAYER ? PLAYER_SPARK : ENEMY_SPARK,
  })
  return unit
}

export function deployStartingForce(game: Game): void {
  for (let i = 0; i < 3; i++) spawnUnit(game, PLAYER, 'footman')
}

export function armyCount(game: Game, side: Side): number {
  let n = 0
  for (const u of game.units) if (u.side === side && u.hp > 0) n++
  return n
}

export function trainUnit(game: Game, kind: UnitKind): boolean {
  if (game.over !== null || !game.started) return false
  const def = KINDS[kind]
  if (game.gold < def.cost || armyCount(game, PLAYER) >= SUPPLY_CAP) return false
  game.gold -= def.cost
  spawnUnit(game, PLAYER, kind)
  return true
}

/** Right-click: attack a specific enemy under the cursor, else attack-move there. */
export function issueCommand(game: Game, x: number, y: number): void {
  if (game.selection.size === 0) return
  let targetId: number | null = null
  for (const u of game.units) {
    if (u.side !== ENEMY || u.hp <= 0) continue
    if (Math.hypot(u.x - x, u.y - y) < KINDS[u.kind].radius + 9) { targetId = u.id; break }
  }
  const eb = game.bases[1]
  if (targetId === null && eb.hp > 0 && Math.hypot(eb.x - x, eb.y - y) < eb.r + 8) targetId = eb.id

  let i = 0
  const n = game.selection.size
  for (const u of game.units) {
    if (!game.selection.has(u.id) || u.hp <= 0) continue
    if (targetId !== null) {
      u.order = { type: 'attack', targetId }
    } else {
      // loose ring formation so the squad doesn't pile onto one point
      const ring = Math.ceil(Math.sqrt(n))
      const a = (i / Math.max(1, n)) * Math.PI * 2
      const r = n > 1 ? 10 + ring * 6 * Math.sqrt(i / n) : 0
      u.order = { type: 'attackmove', x: x + Math.cos(a) * r, y: y + Math.sin(a) * r }
    }
    i++
  }
  game.particles.push({
    kind: 'ripple', x, y, vx: 0, vy: 0, life: 0.45, maxLife: 0.45, size: 22,
    color: targetId !== null ? '#a03024' : '#c9a648',
  })
}

export function selectAt(game: Game, x: number, y: number, additive: boolean): void {
  if (!additive) game.selection.clear()
  for (const u of game.units) {
    if (u.side !== PLAYER || u.hp <= 0) continue
    if (Math.hypot(u.x - x, u.y - y) < KINDS[u.kind].radius + 8) {
      game.selection.add(u.id)
      return
    }
  }
}

export function selectRect(game: Game, x0: number, y0: number, x1: number, y1: number, additive: boolean): void {
  if (!additive) game.selection.clear()
  const [lx, hx] = x0 < x1 ? [x0, x1] : [x1, x0]
  const [ly, hy] = y0 < y1 ? [y0, y1] : [y1, y0]
  for (const u of game.units) {
    if (u.side !== PLAYER || u.hp <= 0) continue
    if (u.x >= lx - 4 && u.x <= hx + 4 && u.y >= ly - 4 && u.y <= hy + 4) game.selection.add(u.id)
  }
}

export function selectAll(game: Game): void {
  game.selection.clear()
  for (const u of game.units) if (u.side === PLAYER && u.hp > 0) game.selection.add(u.id)
}

// ————— damage —————

function addSparks(game: Game, x: number, y: number, color: string, n: number): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const v = 40 + Math.random() * 120
    game.particles.push({
      kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      life: 0.35, maxLife: 0.35, size: 1.5 + Math.random() * 2, color,
    })
  }
}

function killUnit(game: Game, unit: Unit): void {
  unit.hp = 0
  game.selection.delete(unit.id)
  const def = KINDS[unit.kind]
  // ink splatter — the fallen return to the page
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2
    const v = 30 + Math.random() * 150
    game.particles.push({
      kind: 'splat', x: unit.x, y: unit.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      life: 1.6 + Math.random() * 1.2, maxLife: 2.8,
      size: 1.5 + Math.random() * (def.radius * 0.5), color: INK_SPLAT,
    })
  }
  game.blasts.push({ x: unit.x, y: unit.y, r: def.pushR + 70, str: 30000, life: 0.28 })
}

function applyDamage(game: Game, targetId: number, dmg: number, attackerSide: Side): void {
  if (targetId === PLAYER_BASE_ID || targetId === ENEMY_BASE_ID) {
    const base = game.bases[targetId === PLAYER_BASE_ID ? 0 : 1]
    if (base.hp <= 0) return
    base.hp -= dmg
    addSparks(game, base.x + (Math.random() - 0.5) * base.r, base.y + (Math.random() - 0.5) * base.r,
      attackerSide === PLAYER ? PLAYER_SPARK : ENEMY_SPARK, 3)
    if (base.hp <= 0) {
      base.hp = 0
      game.over = base.side === ENEMY ? 'victory' : 'defeat'
      game.blasts.push({ x: base.x, y: base.y, r: 320, str: 60000, life: 0.55 })
      addSparks(game, base.x, base.y, base.side === ENEMY ? PLAYER_SPARK : ENEMY_SPARK, 26)
    }
    return
  }
  for (const u of game.units) {
    if (u.id !== targetId) continue
    u.hp -= dmg
    addSparks(game, u.x, u.y, u.side === PLAYER ? '#8fa7d6' : ENEMY_SPARK, 2)
    game.blasts.push({ x: u.x, y: u.y, r: 44, str: 5200, life: 0.1 })
    if (u.hp <= 0) killUnit(game, u)
    return
  }
}

// ————— enemy AI —————

function enemyThink(game: Game, dt: number): void {
  if (game.grace > 0) {
    game.grace -= dt
    return
  }
  const income = 4.6 + (game.time / 60) * 1.15
  game.enemyGold += income * dt

  // train: mostly ghouls early; heavier stock as the war grinds on
  const late = Math.min(1, game.time / 240)
  if (armyCount(game, ENEMY) < SUPPLY_CAP) {
    const roll = Math.random()
    const kind: UnitKind = roll < 0.55 - late * 0.2 ? 'ghoul' : roll < 0.85 - late * 0.1 ? 'gargoyle' : 'abomination'
    const def = KINDS[kind]
    if (game.enemyGold >= def.cost) {
      game.enemyGold -= def.cost
      const u = spawnUnit(game, ENEMY, kind)
      if (game.aiAttacking) {
        u.order = { type: 'attackmove', x: game.bases[0].x, y: game.bases[0].y }
      }
    }
  }

  const army = armyCount(game, ENEMY)
  if (!game.aiAttacking && army >= game.waveSize) {
    game.aiAttacking = true
    for (const u of game.units) {
      if (u.side !== ENEMY || u.hp <= 0) continue
      u.order = {
        type: 'attackmove',
        x: game.bases[0].x + (Math.random() - 0.5) * 90,
        y: game.bases[0].y + (Math.random() - 0.5) * 90,
      }
    }
  } else if (game.aiAttacking && army === 0) {
    game.aiAttacking = false
    game.waveSize = Math.min(game.waveSize + 2, 26)
  }

  // defend the necropolis if the player pushes in during build-up
  if (!game.aiAttacking) {
    const eb = game.bases[1]
    let threatened = false
    for (const u of game.units) {
      if (u.side === PLAYER && u.hp > 0 && Math.hypot(u.x - eb.x, u.y - eb.y) < 270) { threatened = true; break }
    }
    if (threatened) {
      for (const u of game.units) {
        if (u.side !== ENEMY || u.hp <= 0) continue
        if (u.order.type === 'idle') u.order = { type: 'attackmove', x: eb.x, y: eb.y }
      }
    }
  }
}

// ————— per-unit brain —————

function moveToward(unit: Unit, tx: number, ty: number, dt: number): boolean {
  const dx = tx - unit.x
  const dy = ty - unit.y
  const d = Math.hypot(dx, dy)
  if (d < 6) return true
  const speed = KINDS[unit.kind].speed
  unit.x += (dx / d) * speed * dt
  unit.y += (dy / d) * speed * dt
  unit.facing = Math.atan2(dy, dx)
  return false
}

function engage(game: Game, unit: Unit, target: Target, dt: number): void {
  const def = KINDS[unit.kind]
  const gap = Math.hypot(target.x - unit.x, target.y - unit.y) - target.radius - def.radius
  const reach = def.range > 0 ? def.range : 6
  if (gap > reach) {
    moveToward(unit, target.x, target.y, dt)
    return
  }
  unit.facing = Math.atan2(target.y - unit.y, target.x - unit.x)
  if (unit.cd > 0) return
  unit.cd = def.cooldown
  if (def.projectileSpeed !== undefined) {
    const d = Math.max(1, Math.hypot(target.x - unit.x, target.y - unit.y))
    game.projectiles.push({
      x: unit.x, y: unit.y, dirX: (target.x - unit.x) / d, dirY: (target.y - unit.y) / d,
      side: unit.side, dmg: def.dmg,
      targetId: target.id, speed: def.projectileSpeed, dead: false,
    })
  } else {
    applyDamage(game, target.id, def.dmg, unit.side)
  }
}

function unitThink(game: Game, unit: Unit, dt: number): void {
  const def = KINDS[unit.kind]
  unit.cd = Math.max(0, unit.cd - dt)

  switch (unit.order.type) {
    case 'idle': {
      const foe = nearestEnemy(game, unit, def.aggro)
      if (foe !== null) unit.order = { type: 'attack', targetId: foe.id }
      break
    }
    case 'move': {
      if (moveToward(unit, unit.order.x, unit.order.y, dt)) unit.order = { type: 'idle' }
      break
    }
    case 'attackmove': {
      const foe = nearestEnemy(game, unit, def.aggro)
      if (foe !== null) {
        engage(game, unit, foe, dt)
      } else if (moveToward(unit, unit.order.x, unit.order.y, dt)) {
        unit.order = { type: 'idle' }
      }
      break
    }
    case 'attack': {
      const target = findTarget(game, unit.order.targetId)
      if (target === null) {
        unit.order = { type: 'idle' }
      } else {
        engage(game, unit, target, dt)
      }
      break
    }
  }
}

// ————— frame update —————

export function updateGame(game: Game, dt: number): void {
  // particles & blasts always animate, even on the victory screen
  for (const p of game.particles) {
    p.life -= dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (p.kind === 'splat' || p.kind === 'spark') {
      p.vx *= 1 - 6 * dt
      p.vy *= 1 - 6 * dt
    }
  }
  if (game.particles.length > 500) game.particles.splice(0, game.particles.length - 500)
  game.particles = game.particles.filter(p => p.life > 0)

  for (const b of game.blasts) b.life -= dt
  game.blasts = game.blasts.filter(b => b.life > 0)

  if (!game.started || game.over !== null) return

  game.time += dt
  game.gold = Math.min(9999, game.gold + 7 * dt)

  enemyThink(game, dt)

  for (const u of game.units) {
    if (u.hp > 0) unitThink(game, u, dt)
  }

  // gentle separation so blobs don't merge into one puddle
  const units = game.units
  for (let i = 0; i < units.length; i++) {
    const a = units[i]!
    if (a.hp <= 0) continue
    const ra = KINDS[a.kind].radius
    for (let j = i + 1; j < units.length; j++) {
      const b = units[j]!
      if (b.hp <= 0) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      if (dx > 30 || dx < -30 || dy > 30 || dy < -30) continue
      const rb = KINDS[b.kind].radius
      const min = ra + rb + 2
      const d2 = dx * dx + dy * dy
      if (d2 >= min * min || d2 === 0) continue
      const d = Math.sqrt(d2)
      const push = (min - d) / 2
      const nx = dx / d
      const ny = dy / d
      a.x -= nx * push
      a.y -= ny * push
      b.x += nx * push
      b.y += ny * push
    }
  }

  // keep the armies on the page
  for (const u of game.units) {
    if (u.hp <= 0) continue
    u.x = Math.min(Math.max(u.x, 12), game.vw - 12)
    u.y = Math.min(Math.max(u.y, 12), game.vh - 12)
  }
  game.units = game.units.filter(u => u.hp > 0)

  // projectiles home on their mark
  for (const pr of game.projectiles) {
    const target = findTarget(game, pr.targetId)
    if (target === null) {
      pr.dead = true
      continue
    }
    const dx = target.x - pr.x
    const dy = target.y - pr.y
    const d = Math.hypot(dx, dy)
    const step = pr.speed * dt
    if (d <= step + target.radius) {
      pr.dead = true
      applyDamage(game, pr.targetId, pr.dmg, pr.side)
    } else {
      pr.dirX = dx / d
      pr.dirY = dy / d
      pr.x += pr.dirX * step
      pr.y += pr.dirY * step
    }
  }
  game.projectiles = game.projectiles.filter(p => !p.dead)
}
