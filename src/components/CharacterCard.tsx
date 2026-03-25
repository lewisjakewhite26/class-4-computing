import { motion } from 'framer-motion'
import type { Character } from '../../data/characters'
import { TYPE_COLORS } from '../../data/characters'
import { StatMiniBars } from './StatMiniBars'
import { TypeBadge } from './TypeBadge'

const rarityShadow: Record<string, string> = {
  Legendary: '0 0 24px rgba(201, 146, 42, 0.25)',
  Rare: '0 0 18px rgba(56, 120, 200, 0.2)',
  Common: '0 0 12px rgba(60, 120, 60, 0.15)',
}

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

export function CharacterCard({
  character: c,
  index,
  disabled,
  selected,
  onSelect,
  layoutIdPrefix = 'team',
  hideSharedLayout = false,
  suppressEntrance = false,
}: {
  character: Character
  index: number
  disabled?: boolean
  selected?: boolean
  onSelect?: () => void
  layoutIdPrefix?: string
  /** When true, sidebar owns the shared layout id (avoid duplicate layoutIds). */
  hideSharedLayout?: boolean
  /** Skip mount animation (e.g. parent AnimatePresence handles enter). */
  suppressEntrance?: boolean
}) {
  const t1 = TYPE_COLORS[c.type1] ?? TYPE_COLORS.Normal
  const t2 = TYPE_COLORS[c.type2] ?? TYPE_COLORS.Normal
  const glow = rarityShadow[c.rarity] ?? rarityShadow.Common

  const interactive = Boolean(onSelect && !disabled)

  return (
    <motion.article
      initial={suppressEntrance ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        suppressEntrance
          ? { duration: 0.15 }
          : { delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
      }
      whileHover={interactive ? { y: -4, transition: { duration: 0.2 } } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={[
        'group relative overflow-hidden rounded-2xl border text-left transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(201,146,42,0.2)]',
        interactive ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]' : 'cursor-not-allowed opacity-55',
        selected ? 'ring-2 ring-[#f0b84a] ring-offset-2 ring-offset-[#0d0e1a]' : 'border-[rgba(201,146,42,0.15)]',
      ].join(' ')}
      style={{
        background: 'rgba(26, 29, 53, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: glow,
      }}
      onClick={() => {
        if (!interactive) return
        onSelect?.()
      }}
      onKeyDown={(e) => {
        if (!interactive) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      }}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? 'button' : undefined}
      aria-disabled={disabled || undefined}
      aria-pressed={selected}
    >
      <div
        className="relative h-14 w-full overflow-hidden"
        aria-hidden
        style={{
          background: `linear-gradient(105deg, ${t1.bg} 0%, ${t1.bg} 62%, ${t2.bg} 62%, ${t2.bg} 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-opacity duration-300 group-hover:translate-x-full group-hover:opacity-40 motion-safe:group-hover:transition-transform motion-safe:group-hover:duration-700"
          style={{
            background: `linear-gradient(90deg, transparent, ${t1.glow}, transparent)`,
          }}
        />
      </div>
      <div className="relative p-3 pt-2">
        <div className="mb-2 flex items-start gap-2">
          <motion.div
            layoutId={hideSharedLayout ? undefined : `${layoutIdPrefix}-avatar-${c.id}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg font-[family-name:var(--font-cinzel)] font-semibold text-[#f0ede6]"
            style={{
              borderColor: 'rgba(201, 146, 42, 0.35)',
              background: 'linear-gradient(145deg, #1a1d35, #13152a)',
              boxShadow: `0 0 12px ${t1.glow}40`,
            }}
          >
            {initial(c.name)}
          </motion.div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-[family-name:var(--font-cinzel)] text-[15px] font-semibold tracking-wide text-[#f0ede6]">
              {c.name}
            </h3>
            <p className="truncate text-[13px] text-[#8a8fa8]">
              {c.role} · {c.domain}
            </p>
          </div>
        </div>
        <div className="mb-2 flex flex-wrap gap-1">
          <TypeBadge type={c.type1} />
          <TypeBadge type={c.type2} />
        </div>
        <StatMiniBars
          stats={{ hp: c.hp, atk: c.atk, def: c.def, spatk: c.spatk, spdef: c.spdef, spd: c.spd }}
          compact
        />
        {c.moves && c.moves.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1" style={{ gap: 4 }} aria-label="Moves">
            {c.moves.slice(0, 4).map((mv) => (
              <span
                key={mv.name}
                className="text-[10px] leading-tight text-[#8a8fa8]"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(201, 146, 42, 0.2)',
                  borderRadius: 4,
                  padding: '2px 6px',
                }}
              >
                {mv.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[rgba(201,146,42,0.12)] pt-2">
          <span
            className="rounded-full border border-[rgba(201,146,42,0.25)] bg-[#1a1d35] px-2.5 py-0.5 font-mono text-[13px] text-[#f0b84a]"
            aria-label={`Cost ${c.cost} Drachma`}
          >
            {c.cost} ₯
          </span>
          <span className="font-mono text-[13px] text-[#8a8fa8]" aria-label={`Total base stats ${c.total}`}>
            Σ {c.total}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
