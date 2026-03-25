import { AnimatePresence, motion } from 'framer-motion'
import { useTeam } from '../context/TeamContext'
import { TYPE_COLORS } from '../../data/characters'
import { TypeBadge } from './TypeBadge'

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

export function TeamSidebar({
  className,
  onEnterBattle,
  canEnterBattle = false,
}: {
  className?: string
  onEnterBattle?: () => void
  canEnterBattle?: boolean
}) {
  const {
    roster,
    rosterCount,
    custom,
    customSaved,
    totalSpent,
    budget,
    removeFromSlot,
    removeCustomFromTeam,
    randomiseTeam,
  } = useTeam()

  const customOnTeam = customSaved && custom.name.trim().length > 0
  const customCost = custom.hp + custom.atk + custom.def + custom.spatk + custom.spdef + custom.spd
  const pct = Math.min(100, (totalSpent / budget) * 100)

  return (
    <aside
      className={[
        'flex w-full flex-col border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.7)] backdrop-blur-[12px] lg:sticky lg:top-[var(--mm-header-offset)] lg:h-[calc(100dvh-var(--mm-header-offset))] lg:w-[320px] lg:shrink-0 lg:rounded-2xl lg:border',
        className ?? '',
      ].join(' ')}
      aria-label="Your team sidebar"
    >
      <div className="border-b border-[rgba(201,146,42,0.12)] px-4 py-3">
        <h2 className="font-[family-name:var(--font-cinzel)] text-lg text-[#f0ede6]">Your Team</h2>
        <p className="text-[13px] text-[#8a8fa8]">
          {rosterCount} / 4 Mythmon
          {customOnTeam ? ' · Custom on team' : ''}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {roster.map((c, i) => (
          <div key={i} className="min-h-[72px]">
            <AnimatePresence mode="popLayout">
              {c ? (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-2 rounded-xl border border-[rgba(201,146,42,0.15)] bg-[#13152a] p-2"
                >
                  <motion.div
                    layoutId={`team-avatar-${c.id}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-[family-name:var(--font-cinzel)] font-semibold text-[#f0ede6]"
                    style={{
                      borderColor: 'rgba(201, 146, 42, 0.35)',
                      background: 'linear-gradient(145deg, #1a1d35, #13152a)',
                      boxShadow: `0 0 10px ${(TYPE_COLORS[c.type1] ?? TYPE_COLORS.Normal).glow}44`,
                    }}
                  >
                    {initial(c.name)}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-[family-name:var(--font-cinzel)] text-[13px] text-[#f0ede6]">
                      {c.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-0.5">
                      <TypeBadge type={c.type1} />
                      <TypeBadge type={c.type2} />
                    </div>
                    <p className="mt-0.5 font-mono text-[13px] text-[#f0b84a]">{c.cost} ₯</p>
                  </div>
                  <button
                    type="button"
                    className="flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-lg border border-[rgba(201,146,42,0.2)] text-lg leading-none text-[#8a8fa8] transition-colors hover:border-red-500/40 hover:text-red-300 active:border-red-500/50 active:text-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
                    aria-label={`Remove ${c.name} from team`}
                    onClick={() => removeFromSlot(i)}
                  >
                    ×
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`empty-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-[72px] items-center justify-center rounded-xl border border-dashed border-[rgba(201,146,42,0.2)] bg-[#13152a]/50 px-3"
                >
                  <motion.p
                    animate={{ opacity: [0.45, 0.95, 0.45] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-center text-[13px] text-[#8a8fa8]"
                  >
                    Choose a character
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <div className="mt-1 min-h-[72px]">
          <AnimatePresence mode="popLayout">
            {customOnTeam ? (
              <motion.div
                key="custom-saved"
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 rounded-xl border border-[rgba(201,146,42,0.35)] bg-[#13152a] p-2"
              >
                <motion.div
                  layoutId="team-avatar-custom"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-[family-name:var(--font-cinzel)] font-semibold text-[#f0ede6]"
                  style={{
                    borderColor: 'rgba(201, 146, 42, 0.45)',
                    background: 'linear-gradient(145deg, #2a2540, #13152a)',
                    boxShadow: '0 0 12px rgba(201, 146, 42, 0.2)',
                  }}
                >
                  {initial(custom.name)}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-cinzel)] text-[13px] text-[#f0ede6]">
                    {custom.name.trim()}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-0.5">
                    <TypeBadge type="Normal" />
                    <TypeBadge type="Normal" />
                  </div>
                  <p className="mt-0.5 font-mono text-[13px] text-[#f0b84a]">{customCost} ₯</p>
                </div>
                <button
                  type="button"
                  className="flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-lg border border-[rgba(201,146,42,0.2)] text-lg leading-none text-[#8a8fa8] transition-colors hover:border-red-500/40 hover:text-red-300 active:border-red-500/50 active:text-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
                  aria-label={`Remove ${custom.name.trim()} from team`}
                  onClick={removeCustomFromTeam}
                >
                  ×
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="custom-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border-2 border-dashed border-[rgba(201,146,42,0.45)] bg-[rgba(26,29,53,0.5)] p-3"
                aria-label="Build your own creature slot"
              >
                <p className="font-[family-name:var(--font-cinzel)] text-[13px] font-semibold tracking-wide text-[#f0b84a]">
                  Build Your Own
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[#8a8fa8]">
                  Design in <span className="text-[#f0ede6]">Team Builder</span>, then tap{' '}
                  <span className="text-[#f0ede6]">Save to team</span> to fill this slot.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-auto space-y-3 border-t border-[rgba(201,146,42,0.12)] p-4">
        <div>
          <div className="mb-1 flex justify-between text-[13px]">
            <span className="text-[#8a8fa8]">Spent</span>
            <span className="font-mono text-[#f0ede6]">
              {totalSpent} / {budget} ₯
            </span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-black/40"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Budget used ${Math.round(pct)} percent`}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #c9922a 0%, #f59e0b 55%, #dc2626 100%)',
              }}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1 text-right text-[13px] text-[#f0b84a]">{budget - totalSpent} ₯ left</p>
        </div>
        <button
          type="button"
          className="w-full min-h-[44px] touch-manipulation rounded-xl border border-[rgba(201,146,42,0.35)] bg-[#1a1d35] py-2.5 text-[13px] font-medium text-[#f0ede6] transition-colors hover:bg-[#232742] active:bg-[#2a2e48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
          onClick={randomiseTeam}
        >
          Randomise Team
        </button>
        {onEnterBattle ? (
          <button
            type="button"
            disabled={!canEnterBattle}
            className="w-full min-h-[44px] touch-manipulation rounded-xl border border-[rgba(201,146,42,0.45)] bg-gradient-to-r from-[#2a2210] to-[#1a1d35] py-2.5 font-[family-name:var(--font-cinzel)] text-[14px] font-semibold tracking-wide text-[#c9922a] transition-opacity hover:opacity-95 active:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a] disabled:cursor-not-allowed disabled:opacity-35"
            onClick={onEnterBattle}
          >
            Enter Battle
          </button>
        ) : null}
      </div>
    </aside>
  )
}
