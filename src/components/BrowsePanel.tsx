/**
 * Legacy full-page browse grid (role filter + sort + CharacterCard list).
 * Not linked from the main tab strip — Team Builder + CharacterPickerModal replaced it in the UX.
 * Kept intentionally so the implementation remains available for reference or reuse.
 */
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTeam } from '../context/TeamContext'
import { CHARACTERS, type Character } from '../../data/characters'
import { CharacterCard } from './CharacterCard'

type FilterKey =
  | 'all'
  | 'gods'
  | 'goddesses'
  | 'heroes'
  | 'monsters'
  | 'titans'
  | 'other'

type SortKey = 'id' | 'priceAsc' | 'priceDesc' | 'total' | 'name'

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gods', label: 'Gods' },
  { id: 'goddesses', label: 'Goddesses' },
  { id: 'heroes', label: 'Heroes' },
  { id: 'monsters', label: 'Monsters' },
  { id: 'titans', label: 'Titans' },
  { id: 'other', label: 'Other' },
]

function matchesFilter(c: Character, f: FilterKey): boolean {
  switch (f) {
    case 'all':
      return true
    case 'gods':
      return c.role === 'God'
    case 'goddesses':
      return c.role === 'Goddess'
    case 'heroes':
      return c.role === 'Hero'
    case 'monsters':
      return c.role === 'Monster'
    case 'titans':
      return c.role === 'Titan' || c.domain === 'Titan'
    case 'other':
      return !['God', 'Goddess', 'Hero', 'Monster', 'Titan'].includes(c.role) && c.domain !== 'Titan'
    default:
      return true
  }
}

export function BrowsePanel() {
  const { addCharacter, isOnTeam, canAfford, rosterCount } = useTeam()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('id')

  const rosterFull = rosterCount >= 4

  const list = useMemo(() => {
    const arr = CHARACTERS.filter((c) => matchesFilter(c, filter))
    const s = [...arr]
    switch (sort) {
      case 'priceAsc':
        s.sort((a, b) => a.cost - b.cost)
        break
      case 'priceDesc':
        s.sort((a, b) => b.cost - a.cost)
        break
      case 'total':
        s.sort((a, b) => b.total - a.total)
        break
      case 'name':
        s.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        s.sort((a, b) => a.id - b.id)
    }
    return s
  }, [filter, sort])

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="pb-10 pt-4"
    >
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by role">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[
                'min-h-[40px] rounded-full border px-3 py-1.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]',
                filter === f.id
                  ? 'border-[#c9922a] bg-[#1a1d35] text-[#f0ede6]'
                  : 'border-[rgba(201,146,42,0.2)] bg-[#13152a] text-[#8a8fa8] hover:text-[#f0ede6]',
              ].join(' ')}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-[13px] text-[#8a8fa8]">
            <span className="shrink-0">Sort</span>
            <select
              className="min-h-[44px] min-w-[12rem] rounded-xl border border-[rgba(201,146,42,0.2)] bg-[#13152a] px-3 py-2 text-[13px] text-[#f0ede6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort characters"
            >
              <option value="id">By number</option>
              <option value="priceAsc">Price low–high</option>
              <option value="priceDesc">Price high–low</option>
              <option value="total">Total stats</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
      </div>
      <div
        className="mb-6 rounded-2xl border border-[rgba(201,146,42,0.12)] bg-[rgba(26,29,53,0.45)] p-3 text-[13px] text-[#8a8fa8] backdrop-blur-md"
        role="note"
      >
        <span className="font-medium text-[#f0ede6]">Drachma prices</span> are set per Mythmon — check each card.
        Strong picks can cost more; clever choices leave extra budget for your custom creature.
      </div>
      <div
        className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]"
        role="list"
      >
        {list.map((c, index) => {
          const onTeam = isOnTeam(c.id)
          const afford = canAfford(c.cost)
          const disabled = onTeam || rosterFull || !afford
          return (
            <div key={c.id} role="listitem">
              <CharacterCard
                character={c}
                index={index}
                disabled={disabled}
                selected={onTeam}
                hideSharedLayout={onTeam}
                onSelect={() => addCharacter(c)}
              />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
