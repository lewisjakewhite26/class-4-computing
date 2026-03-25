import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  CHARACTERS,
  TYPE_COLORS,
  type Character,
} from '../../data/characters'
import { useTeam } from '../context/TeamContext'
import { CharacterCard } from './CharacterCard'

type RoleFilterKey =
  | 'all'
  | 'gods'
  | 'goddesses'
  | 'heroes'
  | 'monsters'
  | 'titans'
  | 'other'

type TypeFilterKey = 'all' | string

type SortKey = 'id' | 'priceAsc' | 'priceDesc' | 'total'

const ROLE_FILTERS: { id: RoleFilterKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gods', label: 'Gods' },
  { id: 'goddesses', label: 'Goddesses' },
  { id: 'heroes', label: 'Heroes' },
  { id: 'monsters', label: 'Monsters' },
  { id: 'titans', label: 'Titans' },
  { id: 'other', label: 'Other' },
]

const TYPE_FILTER_ORDER = [
  'Electric',
  'Flying',
  'Water',
  'Ground',
  'Ghost',
  'Dark',
  'Psychic',
  'Steel',
  'Fighting',
  'Fire',
  'Fairy',
  'Normal',
  'Rock',
  'Poison',
  'Grass',
  'Dragon',
] as const

function matchesRole(c: Character, f: RoleFilterKey): boolean {
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
      return (
        !['God', 'Goddess', 'Hero', 'Monster', 'Titan'].includes(c.role) &&
        c.domain !== 'Titan'
      )
    default:
      return true
  }
}

function matchesType(c: Character, t: TypeFilterKey): boolean {
  if (t === 'all') return true
  return c.type1 === t || c.type2 === t
}

export function CharacterPickerModal({
  isOpen,
  onClose,
  onSelect,
  remainingBudget,
  teamIds,
  slotIndex,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (character: Character) => void
  remainingBudget: number
  teamIds: number[]
  slotIndex: number | null
}) {
  const { canAffordInSlot } = useTeam()
  const [roleFilter, setRoleFilter] = useState<RoleFilterKey>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilterKey>('all')
  const [sort, setSort] = useState<SortKey>('id')

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  const teamSet = useMemo(() => new Set(teamIds), [teamIds])
  const gridScrollRef = useRef<HTMLDivElement>(null)

  const list = useMemo(() => {
    const arr = CHARACTERS.filter(
      (c) => matchesRole(c, roleFilter) && matchesType(c, typeFilter),
    )
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
      default:
        s.sort((a, b) => a.id - b.id)
    }
    return s
  }, [roleFilter, typeFilter, sort])

  useLayoutEffect(() => {
    const el = gridScrollRef.current
    if (!el) return
    el.scrollTop = 0
  }, [roleFilter, typeFilter, sort])

  const afford = (cost: number) =>
    slotIndex !== null && canAffordInSlot(slotIndex, cost)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col justify-start"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close picker"
            className="absolute inset-0 border-0"
            style={{
              background: 'rgba(10, 11, 22, 0.97)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="picker-title"
            className="relative z-[86] flex max-h-[90vh] w-full flex-col overflow-hidden rounded-b-2xl border border-[rgba(201,146,42,0.2)] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
            style={{
              background: 'rgba(10, 11, 22, 0.97)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
            }}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="shrink-0 border-b border-[rgba(201,146,42,0.12)] px-4 pb-3 pt-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="picker-title"
                    className="font-[family-name:var(--font-cinzel)] text-xl font-semibold tracking-wide text-[#f0b84a]"
                  >
                    Choose Your Mythmon
                  </h2>
                  <p className="mt-1 text-[13px] text-[#8a8fa8]">
                    You have {remainingBudget} Drachma remaining
                  </p>
                </div>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg text-2xl leading-none text-[#8a8fa8] transition-colors hover:text-[#f0ede6]"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="shrink-0 space-y-2 border-b border-[rgba(201,146,42,0.1)] bg-[rgba(10,11,22,0.98)] px-4 py-2">
              <div
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
                role="group"
                aria-label="Filter by role"
              >
                {ROLE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={[
                      'shrink-0 min-h-[40px] rounded-full border px-3 py-1.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]',
                      roleFilter === f.id
                        ? 'border-[#c9922a] bg-[#1a1d35] text-[#f0ede6]'
                        : 'border-[rgba(201,146,42,0.2)] bg-[#13152a] text-[#8a8fa8] hover:text-[#f0ede6]',
                    ].join(' ')}
                    onClick={() => setRoleFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
                role="group"
                aria-label="Filter by type"
              >
                <button
                  type="button"
                  className={[
                    'shrink-0 min-h-[40px] rounded-full border px-3 py-1.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]',
                    typeFilter === 'all'
                      ? 'border-[#c9922a] bg-[#1a1d35] text-[#f0ede6]'
                      : 'border-[rgba(201,146,42,0.2)] bg-[#13152a] text-[#8a8fa8] hover:text-[#f0ede6]',
                  ].join(' ')}
                  onClick={() => setTypeFilter('all')}
                >
                  All Types
                </button>
                {TYPE_FILTER_ORDER.map((t) => {
                  const col = TYPE_COLORS[t]
                  const on = typeFilter === t
                  return (
                    <button
                      key={t}
                      type="button"
                      className={[
                        'shrink-0 min-h-[40px] rounded-full border px-3 py-1.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]',
                        on
                          ? 'border-[#c9922a] text-[#f0ede6]'
                          : 'border-[rgba(201,146,42,0.2)] text-[#8a8fa8] hover:text-[#f0ede6]',
                      ].join(' ')}
                      style={
                        on
                          ? { background: col?.bg ?? '#1a1d35' }
                          : { background: '#13152a' }
                      }
                      onClick={() => setTypeFilter(t)}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
              <label className="flex items-center gap-2 pb-1 text-[13px] text-[#8a8fa8]">
                <span className="shrink-0">Sort</span>
                <select
                  className="min-h-[40px] min-w-[11rem] rounded-xl border border-[rgba(201,146,42,0.2)] bg-[#13152a] px-3 py-2 text-[13px] text-[#f0ede6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort characters"
                >
                  <option value="id">By number</option>
                  <option value="priceAsc">Price low–high</option>
                  <option value="priceDesc">Price high–low</option>
                  <option value="total">Total stats</option>
                </select>
              </label>
            </div>

            <div
              ref={gridScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4"
            >
              <LayoutGroup id="character-picker-grid">
                <div
                  className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]"
                  role="list"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {list.map((c, index) => {
                      const onTeam = teamSet.has(c.id)
                      const ok = afford(c.cost)
                      const disabled = onTeam || !ok
                      return (
                        <motion.div
                          key={c.id}
                          layout
                          role="listitem"
                          className="relative"
                          initial={{ opacity: 0, scale: 0.97, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.97, y: -4 }}
                          transition={{
                            type: 'spring',
                            stiffness: 520,
                            damping: 38,
                            mass: 0.65,
                            opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                          }}
                        >
                          <CharacterCard
                            character={c}
                            index={index}
                            disabled={disabled}
                            selected={onTeam}
                            hideSharedLayout
                            suppressEntrance
                            onSelect={() => {
                              if (disabled) return
                              onSelect(c)
                            }}
                          />
                          {onTeam && (
                            <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-full border border-[rgba(201,146,42,0.35)] bg-[#1a1d35]/95 px-2 py-0.5 text-[11px] font-medium text-[#f0b84a]">
                              In team
                            </div>
                          )}
                          {!onTeam && !ok && (
                            <div className="pointer-events-none absolute inset-x-2 bottom-3 z-10 flex justify-center">
                              <span className="rounded-full border border-[rgba(201,146,42,0.2)] bg-[#0d0e1a]/90 px-2 py-0.5 text-[11px] text-[#8a8fa8]">
                                Can&apos;t afford
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
              {list.length === 0 && (
                <p className="py-8 text-center text-[13px] text-[#8a8fa8]">
                  No Mythmon match these filters. Try widening role or type.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
