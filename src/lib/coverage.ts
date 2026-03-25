import { ALL_TYPES, type Character } from '../../data/characters'
import type { CustomCreature } from '../context/TeamContext'

export function customAsCharacter(custom: CustomCreature): Character | null {
  const name = custom.name.trim()
  if (!name) return null
  const total =
    custom.hp + custom.atk + custom.def + custom.spatk + custom.spdef + custom.spd
  return {
    id: -1,
    name,
    role: 'Custom',
    domain: 'Your Creation',
    type1: 'Normal',
    type2: 'Normal',
    weapon: 'Imagination',
    ability1: 'Unique',
    ability2: 'Yours',
    hp: custom.hp,
    atk: custom.atk,
    def: custom.def,
    spatk: custom.spatk,
    spdef: custom.spdef,
    spd: custom.spd,
    total,
    rarity: 'Common',
    cost: total,
    strong: [],
    weak: [],
  }
}

export function uncoveredStrongTypes(members: Character[]): string[] {
  const covered = new Set<string>()
  for (const m of members) {
    for (const t of m.strong) covered.add(t)
  }
  return ALL_TYPES.filter((t) => !covered.has(t))
}
