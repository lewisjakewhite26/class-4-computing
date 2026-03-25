import type { Character, CharacterMove } from '../../data/characters'
import type { CustomCreature } from '../context/TeamContext'

/** Stable id so perf / logs never collide with roster characters (1–48). */
export const CUSTOM_MYTHMON_BATTLE_ID = 99_001

/** Generic kit when the player designs stats only (Normal-type, mirrors premade move count). */
const CUSTOM_BLUEPRINT_MOVES: CharacterMove[] = [
  {
    name: 'Sketch Strike',
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 25,
    effect: 'A simple physical blow from your blueprint.',
  },
  {
    name: 'Improv Pulse',
    type: 'Normal',
    category: 'Special',
    power: 55,
    accuracy: 100,
    pp: 20,
    effect: 'Raw creative energy as a special blast.',
  },
  {
    name: 'Second Wind',
    type: 'Normal',
    category: 'Status',
    power: null,
    accuracy: null,
    pp: 15,
    effect: 'Catches a breath. May raise Speed.',
  },
  {
    name: 'Wildcard Rush',
    type: 'Normal',
    category: 'Physical',
    power: 70,
    accuracy: 90,
    pp: 10,
    effect: 'An all-out rush. Risky but strong.',
  },
]

/** Turn Team Builder "Save to team" creature into a Character for battle routing. */
export function customCreatureToCharacter(c: CustomCreature): Character {
  const name = c.name.trim()
  const total = c.hp + c.atk + c.def + c.spatk + c.spdef + c.spd
  return {
    id: CUSTOM_MYTHMON_BATTLE_ID,
    name: name || 'Your Mythmon',
    role: 'Mythmon',
    domain: 'Custom',
    type1: 'Normal',
    type2: 'Normal',
    weapon: '—',
    ability1: 'Blueprint',
    ability2: 'Unique',
    hp: c.hp,
    atk: c.atk,
    def: c.def,
    spatk: c.spatk,
    spdef: c.spdef,
    spd: c.spd,
    total,
    rarity: 'Common',
    cost: total,
    strong: [],
    weak: ['Fighting'],
    moves: CUSTOM_BLUEPRINT_MOVES,
  }
}
