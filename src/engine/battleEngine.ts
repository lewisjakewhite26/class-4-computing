import type { Character } from '../../data/characters'

export interface BattleMove {
  name: string
  type: string
  category: 'Physical' | 'Special' | 'Status'
  power: number | null
  accuracy: number | null
  pp: number
  effect: string
}

export interface BattlePokemon {
  id: number
  name: string
  type1: string
  type2: string
  hp: number
  atk: number
  def: number
  spatk: number
  spdef: number
  spd: number
  total: number
  moves: BattleMove[]
  currentHp: number
  maxHp: number
  currentPp: Record<string, number>
  status: 'none' | 'paralysed' | 'poisoned' | 'burned' | 'asleep' | 'confused'
  statusTurns: number
  weak: string[]
}

export interface BattleLogEntry {
  id: number
  type: 'move' | 'damage' | 'status' | 'faint' | 'switch' | 'info' | 'effectiveness'
  text: string
  color?: string
}

const DEFENDER_WEAK: Record<string, string[]> = {
  Electric: ['Ground'],
  Flying: ['Electric', 'Rock', 'Steel'],
  Water: ['Electric', 'Grass'],
  Ground: ['Grass', 'Water', 'Ice'],
  Ghost: ['Dark', 'Ghost'],
  Dark: ['Fighting', 'Bug', 'Fairy'],
  Psychic: ['Bug', 'Dark', 'Ghost'],
  Steel: ['Fighting', 'Fire', 'Ground'],
  Fighting: ['Flying', 'Psychic', 'Fairy'],
  Fire: ['Ground', 'Rock', 'Water'],
  Fairy: ['Poison', 'Steel'],
  Normal: ['Fighting'],
  Rock: ['Fighting', 'Grass', 'Ground', 'Steel', 'Water'],
  Poison: ['Ground', 'Psychic'],
  Grass: ['Bug', 'Fire', 'Flying', 'Ice', 'Poison'],
  Dragon: ['Dragon', 'Fairy', 'Ice'],
}

const DEFENDER_RESIST: Record<string, string[]> = {
  Electric: ['Electric', 'Flying', 'Steel'],
  Flying: ['Bug', 'Fighting', 'Grass'],
  Water: ['Fire', 'Ice', 'Steel', 'Water'],
  Ground: ['Poison', 'Rock'],
  Ghost: ['Bug', 'Poison'],
  Dark: ['Dark', 'Ghost'],
  Psychic: ['Fighting', 'Psychic'],
  Steel: ['Bug', 'Dragon', 'Fairy', 'Flying', 'Grass', 'Ice', 'Normal', 'Psychic', 'Rock', 'Steel'],
  Fighting: ['Bug', 'Dark', 'Rock'],
  Fire: ['Bug', 'Fairy', 'Fire', 'Grass', 'Ice', 'Steel'],
  Fairy: ['Bug', 'Dark', 'Fighting'],
  Normal: [],
  Rock: ['Fire', 'Flying', 'Normal', 'Poison'],
  Poison: ['Bug', 'Fairy', 'Fighting', 'Grass', 'Poison'],
  Grass: ['Electric', 'Grass', 'Ground', 'Water'],
  Dragon: ['Electric', 'Fire', 'Grass', 'Water'],
}

const DEFAULT_MOVES: BattleMove[] = [
  {
    name: 'Struggle',
    type: 'Normal',
    category: 'Physical',
    power: 50,
    accuracy: 100,
    pp: 10,
    effect: 'A desperate attack when no moves remain.',
  },
]

function normalizeMoves(moves: Character['moves']): BattleMove[] {
  const raw = moves?.length ? moves : DEFAULT_MOVES
  return raw.slice(0, 4).map((m) => ({
    ...m,
    category:
      m.category === 'Physical' || m.category === 'Special' || m.category === 'Status'
        ? m.category
        : 'Special',
  }))
}

export function getTypeMultiplier(moveType: string, defender: BattlePokemon): number {
  const defTypes = [defender.type1, defender.type2].filter(Boolean)
  let mult = 1
  for (const defType of defTypes) {
    if (DEFENDER_WEAK[defType]?.includes(moveType)) mult *= 2
    else if (DEFENDER_RESIST[defType]?.includes(moveType)) mult *= 0.5
  }
  return mult
}

/** Lower on early trainers — fewer surprise crits for kids. */
export function getCritChance(difficulty: 1 | 2 | 3 | 4 | 5): number {
  const t: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0.02,
    2: 0.035,
    3: 0.05,
    4: 0.05625,
    5: 0.0625,
  }
  return t[difficulty]
}

/** Scales opponent Mythmon stats — softer at low trainer difficulty. */
export function getDifficultyStatMultiplier(difficulty: 1 | 2 | 3 | 4 | 5): number {
  const m: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0.58,
    2: 0.7,
    3: 0.8,
    4: 0.9,
    5: 1.0,
  }
  return m[difficulty]
}

const DAMAGE_SCALAR: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0.3,
  2: 0.45,
  3: 0.65,
  4: 0.82,
  5: 1.0,
}

export function calcDamage(
  attacker: BattlePokemon,
  move: BattleMove,
  defender: BattlePokemon,
  difficulty: 1 | 2 | 3 | 4 | 5 = 5,
): { damage: number; mult: number; isCritical: boolean } {
  if (move.category === 'Status' || !move.power) {
    return { damage: 0, mult: 1, isCritical: false }
  }
  const atkStat =
    move.category === 'Physical'
      ? attacker.status === 'burned'
        ? Math.floor(attacker.atk / 2)
        : attacker.atk
      : attacker.spatk
  const defStat = move.category === 'Physical' ? defender.def : defender.spdef
  const base =
    Math.floor((Math.floor(2 * 50 / 5 + 2) * move.power * atkStat) / defStat / 50) + 2
  const mult = getTypeMultiplier(move.type, defender)
  const critChance = getCritChance(difficulty)
  const isCritical = Math.random() < critChance
  const critMult = isCritical ? 1.5 : 1
  const randomFactor = (Math.floor(Math.random() * 39) + 217) / 255
  const scalar = DAMAGE_SCALAR[difficulty]
  const damage = Math.max(
    1,
    Math.floor(base * mult * critMult * randomFactor * scalar),
  )
  return { damage, mult, isCritical }
}

export function applyStatusFromMove(
  move: BattleMove,
  target: BattlePokemon,
  difficulty: 1 | 2 | 3 | 4 | 5,
  currentTurn: number,
): string | null {
  if (target.status !== 'none') return null

  if (difficulty <= 2 && currentTurn < 3) return null

  if (difficulty === 1) return null

  const eff = move.effect.toLowerCase()
  const isStatus = move.category === 'Status'

  const checks: [string, string, number][] = [
    ['paralys', 'paralysed', isStatus ? 1.0 : 0.25],
    ['burn', 'burned', isStatus ? 1.0 : 0.25],
    ['poison', 'poisoned', isStatus ? 0.9 : 0.3],
    ['sleep', 'asleep', isStatus ? 0.9 : 0.05],
    ['confus', 'confused', isStatus ? 0.9 : 0.3],
  ]
  for (const [keyword, status, chance] of checks) {
    if (eff.includes(keyword) && Math.random() < chance) return status
  }
  return null
}

export function missesAccuracy(move: BattleMove): boolean {
  if (move.accuracy === null) return false
  return Math.random() * 100 > move.accuracy
}

export const STRUGGLE_MOVE: BattleMove = DEFAULT_MOVES[0]!

export function selectAiMove(ai: BattlePokemon, player: BattlePokemon): BattleMove {
  const available = ai.moves.filter((m) => (ai.currentPp[m.name] ?? m.pp) > 0)
  if (available.length === 0) return STRUGGLE_MOVE
  const scored = available.map((m) => {
    const mult = getTypeMultiplier(m.type, player)
    const power = m.power ?? 0
    const statusBonus = m.category === 'Status' && ai.currentHp > ai.maxHp * 0.5 ? 30 : 0
    const score = mult * power * 1.5 + statusBonus + Math.random() * 25
    return { move: m, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0].move
}

const PLAYER_HP_BONUS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 2.2,
  2: 1.8,
  3: 1.4,
  4: 1.15,
  5: 1.0,
}

export function characterToBattlePokemon(
  c: Character,
  difficultyMult: number = 1.0,
  isPlayer: boolean = false,
  difficulty: 1 | 2 | 3 | 4 | 5 = 5,
): BattlePokemon {
  const moves = normalizeMoves(c.moves)
  const scale = (val: number) => Math.max(1, Math.round(val * difficultyMult))

  const hpMult = isPlayer ? PLAYER_HP_BONUS[difficulty] : difficultyMult
  const scaledHp = Math.max(1, Math.round(c.hp * hpMult))

  const hpStat = isPlayer ? Math.max(1, Math.round(c.hp)) : scale(c.hp)
  const atkStat = isPlayer ? c.atk : scale(c.atk)
  const defStat = isPlayer ? c.def : scale(c.def)
  const spatkStat = isPlayer ? c.spatk : scale(c.spatk)
  const spdefStat = isPlayer ? c.spdef : scale(c.spdef)
  const spdStat = isPlayer ? c.spd : scale(c.spd)

  const totalStat = isPlayer
    ? c.total - c.hp + scaledHp
    : scale(c.hp) + scale(c.atk) + scale(c.def) + scale(c.spatk) + scale(c.spdef) + scale(c.spd)

  return {
    ...c,
    hp: hpStat,
    atk: atkStat,
    def: defStat,
    spatk: spatkStat,
    spdef: spdefStat,
    spd: spdStat,
    total: totalStat,
    moves,
    currentHp: scaledHp,
    maxHp: scaledHp,
    currentPp: Object.fromEntries(moves.map((m) => [m.name, m.pp])),
    status: 'none',
    statusTurns: 0,
  }
}

/** Readable stats + effect text for log and tooltips. */
export function formatMoveSummary(m: BattleMove): string {
  const acc = m.accuracy === null ? '—' : `${m.accuracy}%`
  const eff = m.effect.trim()
  if (m.category === 'Status') {
    const tail = eff || 'Supports the user or disrupts the foe — check the battle log for results.'
    return `Status · ${m.type} · Acc ${acc} — ${tail}`
  }
  const pow = m.power === null ? '—' : String(m.power)
  const base = `${m.type} · ${m.category} · Power ${pow} · Acc ${acc}`
  return eff ? `${base} — ${eff}` : base
}

export function effectivenessLabel(mult: number): string {
  if (mult >= 2) return "It's super effective!"
  if (mult < 1) return "It's not very effective..."
  return ''
}

export function effectivenessColor(mult: number): string {
  if (mult >= 2) return '#f0b84a'
  if (mult < 1) return '#8a8fa8'
  return '#f0ede6'
}

/** Self-hit confusion: 60 power Normal Physical vs self. */
export function calcConfusionSelfDamage(mon: BattlePokemon): number {
  const fakeMove: BattleMove = {
    name: 'Confusion',
    type: 'Normal',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 1,
    effect: '',
  }
  return calcDamage(mon, fakeMove, mon, 5).damage
}

export function statusDamagePoison(mon: BattlePokemon): number {
  return Math.max(1, Math.floor(mon.maxHp / 8))
}

export function statusDamageBurn(mon: BattlePokemon): number {
  return Math.max(1, Math.floor(mon.maxHp / 16))
}
