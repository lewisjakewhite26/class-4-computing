import { AnimatePresence, motion } from 'framer-motion'

export function HpBar({
  current,
  max,
  showNumbers,
  flashKey,
}: {
  current: number
  max: number
  showNumbers?: boolean
  flashKey?: number
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0
  const barColor = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#dc2626'
  const fk = flashKey ?? 0

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <div className="relative h-3 min-h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-black/50">
        <motion.div
          className="relative z-0 h-full rounded-full"
          initial={false}
          animate={{
            width: `${pct}%`,
            backgroundColor: barColor,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <AnimatePresence mode="popLayout">
          {fk > 0 ? (
            <motion.div
              key={fk}
              className="pointer-events-none absolute inset-y-0 left-0 z-10 h-full max-w-full rounded-full bg-white"
              initial={{ width: `${pct}%`, opacity: 0.95 }}
              animate={{ width: `${pct}%`, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.22, ease: 'easeOut' } }}
            />
          ) : null}
        </AnimatePresence>
      </div>
      {showNumbers ? (
        <span className="shrink-0 font-mono text-[12px] text-[#f0ede6] tabular-nums">
          {current} / {max}
        </span>
      ) : null}
    </div>
  )
}
