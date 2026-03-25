import { motion } from 'framer-motion'
import { useTeam } from '../context/TeamContext'

export function AppHeader({ onOpenTeam }: { onOpenTeam?: () => void }) {
  const { remaining, budget } = useTeam()

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[rgba(201,146,42,0.15)] bg-[#0d0e1a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-3 min-[1200px]:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="font-[family-name:var(--font-cinzel)] text-[clamp(1.05rem,2.5vw,1.65rem)] font-semibold tracking-wide text-[#f0ede6]">
            Mythmon Team Builder
          </h1>
          <p className="mt-0.5 text-[13px] text-[#8a8fa8]">
            Assemble your team wisely — you only have 500 Drachma.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-[rgba(201,146,42,0.35)] bg-[#13152a] px-3 py-2 text-[13px] font-medium text-[#f0ede6] transition-colors hover:bg-[#1a1d35] min-[1200px]:hidden"
            onClick={onOpenTeam}
          >
            My Team
          </button>
          <motion.div
            className="flex min-h-[44px] min-w-[7rem] flex-col items-end justify-center rounded-xl border border-[rgba(201,146,42,0.25)] bg-[rgba(26,29,53,0.75)] px-3 py-1.5 backdrop-blur-md"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 0.45, times: [0, 0.4, 1] }}
            key={remaining}
          >
            <span className="text-[10px] uppercase tracking-widest text-[#8a8fa8]">Drachma</span>
            <span className="font-mono text-lg font-semibold tabular-nums">
              <motion.span
                key={remaining}
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="inline-block text-[#f0b84a]"
              >
                {remaining}
              </motion.span>
              <span className="text-[#8a8fa8]"> / {budget}</span>
            </span>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
