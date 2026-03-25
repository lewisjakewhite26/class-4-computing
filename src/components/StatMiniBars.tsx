const CONFIG = [
  { key: 'hp', label: 'HP', color: '#c84b31' },
  { key: 'atk', label: 'ATK', color: '#e8692a' },
  { key: 'def', label: 'DEF', color: '#4a90d9' },
  { key: 'spatk', label: 'SPA', color: '#9b5fc0' },
  { key: 'spdef', label: 'SDF', color: '#5aad5a' },
  { key: 'spd', label: 'SPE', color: '#c9922a' },
] as const

export function StatMiniBars({
  stats,
  max = 255,
  compact,
}: {
  stats: { hp: number; atk: number; def: number; spatk: number; spdef: number; spd: number }
  max?: number
  compact?: boolean
}) {
  return (
    <div className={compact ? 'grid grid-cols-6 gap-1' : 'grid grid-cols-3 gap-1.5'}>
      {CONFIG.map(({ key, label, color }) => {
        const v = stats[key]
        const pct = Math.min(100, Math.round((v / max) * 100))
        return (
          <div key={key} className="min-w-0">
            <div className="mb-0.5 flex justify-between text-[13px] uppercase tracking-wider text-[#8a8fa8]">
              <span>{label}</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-black/40"
              role="img"
              aria-label={`${label}: ${v} out of ${max}`}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}66`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
