import type { Character } from '../../data/characters'
import type { BattlePokemon } from '../engine/battleEngine'

export interface PerfRow {
  id: number
  name: string
  type1: string
  type2: string
  damageDealt: number
  damageTaken: number
  fainted: boolean
  faintedTurn: number | null
  hpRemaining: number | null
  bestMove: string | null
  bestMoveDamage: number
}

type PerfInner = {
  damageDealt: number
  damageTaken: number
  bestMove: string | null
  bestMoveDamage: number
  faintedTurn: number | null
  finalHp: number | null
}

export function buildPerfRows(
  playerSource: Character[],
  perf: Map<number, PerfInner>,
  liveTeam: BattlePokemon[],
): PerfRow[] {
  return playerSource.map((c) => {
    const p = perf.get(c.id) ?? {
      damageDealt: 0,
      damageTaken: 0,
      bestMove: null,
      bestMoveDamage: 0,
      faintedTurn: null,
      finalHp: c.hp,
    }
    const fainted = p.faintedTurn != null
    const live = liveTeam.find((m) => m.id === c.id)
    const hpLeft = fainted ? null : (live?.currentHp ?? p.finalHp ?? c.hp)
    return {
      id: c.id,
      name: c.name,
      type1: c.type1,
      type2: c.type2,
      damageDealt: p.damageDealt,
      damageTaken: p.damageTaken,
      fainted,
      faintedTurn: p.faintedTurn,
      hpRemaining: hpLeft,
      bestMove: p.bestMove,
      bestMoveDamage: p.bestMoveDamage,
    }
  })
}
