import type { Character } from '../../data/characters'
import type { CustomCreature } from '../context/TeamContext'
import { customCreatureToCharacter } from './customCreatureToCharacter'

/** Roster slots (0–3) plus optional saved custom — same list used for Enter Battle and BattlePage. */
export function buildPlayerBattleRoster(
  roster: (Character | null)[],
  custom: CustomCreature,
  customSaved: boolean,
): Character[] {
  const rosterChars = roster.filter((x): x is Character => x != null)
  const customOnTeam =
    customSaved && custom.name.trim().length > 0 ? customCreatureToCharacter(custom) : null
  return customOnTeam ? [...rosterChars, customOnTeam] : rosterChars
}

export function canEnterBattleFromRoster(
  roster: (Character | null)[],
  custom: CustomCreature,
  customSaved: boolean,
): boolean {
  const hasRoster = roster.some(Boolean)
  const hasCustom = customSaved && custom.name.trim().length > 0
  return hasRoster || hasCustom
}
