/** UI / narrowed types for components (character data stays in `data/characters.ts`). */

export type { Character } from '../../data/characters'

export type CharacterMoveCategory = 'Physical' | 'Special' | 'Status'

export type UiCharacterMove = {
  name: string
  type: string
  category: CharacterMoveCategory
  power: number | null
  accuracy: number | null
  pp: number
  effect: string
}

export function normalizeMoveCategory(raw: string): CharacterMoveCategory {
  const c = raw.trim()
  if (c === 'Physical' || c === 'Special' || c === 'Status') return c
  return 'Special'
}

export function toUiMoves(
  moves: { name: string; type: string; category: string; power: number | null; accuracy: number | null; pp: number; effect: string }[] | undefined,
): UiCharacterMove[] {
  if (!moves?.length) return []
  return moves.map((m) => ({
    ...m,
    category: normalizeMoveCategory(m.category),
  }))
}
