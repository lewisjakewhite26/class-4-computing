import { motion } from 'framer-motion'

export type MainTab = 'builder' | 'team' | 'battle'

const TABS: { id: MainTab; label: string }[] = [
  { id: 'builder', label: 'Team Builder' },
  { id: 'team', label: 'My Team' },
  { id: 'battle', label: 'Battle Stats' },
]

export function TabStrip({
  active,
  onChange,
}: {
  active: MainTab
  onChange: (t: MainTab) => void
}) {
  return (
    <nav
      className="sticky top-[var(--mm-header-offset)] z-40 -mx-4 border-b border-[rgba(201,146,42,0.12)] bg-[#0d0e1a]/95 py-2 pl-[max(1rem,var(--mm-safe-left))] pr-[max(1rem,var(--mm-safe-right))] backdrop-blur-md lg:mx-0 lg:rounded-none lg:px-6"
      aria-label="Main sections"
    >
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const isOn = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isOn}
              className={[
                'relative min-h-[44px] touch-manipulation rounded-xl px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]',
                isOn
                  ? 'text-[#f0ede6]'
                  : 'text-[#8a8fa8] hover:text-[#f0ede6] active:bg-white/5 active:text-[#f0ede6]',
              ].join(' ')}
              onClick={() => onChange(t.id)}
            >
              {isOn && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-10 rounded-xl border border-[rgba(201,146,42,0.25)] bg-[#13152a]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
