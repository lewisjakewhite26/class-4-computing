import type { BattleMove, BattlePokemon } from '../../engine/battleEngine'
import { TYPE_COLORS } from '../../../data/characters'

function categoryClass(cat: string) {
  if (cat === 'Physical') return 'bg-[#712B13]/80 text-[#FAECE7]'
  if (cat === 'Special') return 'bg-[#72243E]/80 text-[#FBEAF0]'
  return 'bg-[#3C3489]/80 text-[#EEEDFE]'
}

function movePowerAccuracyLine(m: BattleMove) {
  if (m.category === 'Status') {
    return `Status · Acc ${m.accuracy === null ? '—' : `${m.accuracy}%`}`
  }
  return `Pow ${m.power ?? '—'} · Acc ${m.accuracy === null ? '—' : `${m.accuracy}%`}`
}

export function MoveButtons({
  active,
  disabled,
  waiting,
  asleep,
  onMove,
  onOpenSwitch,
  onSkipTurn,
}: {
  active: BattlePokemon
  disabled: boolean
  waiting: boolean
  asleep: boolean
  onMove: (m: BattleMove) => void
  onOpenSwitch: () => void
  onSkipTurn: () => void
}) {
  const grid = active.moves.slice(0, 4)
  while (grid.length < 4) {
    grid.push({
      name: '—',
      type: 'Normal',
      category: 'Status',
      power: null,
      accuracy: null,
      pp: 0,
      effect: '',
    })
  }

  if (asleep) {
    return (
      <div className="flex min-h-[200px] flex-col justify-center rounded-2xl border border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.7)] p-4 text-center backdrop-blur-[12px]">
        <p className="font-[family-name:var(--font-cinzel)] text-[15px] text-[#378ADD]">
          Asleep — cannot move
        </p>
        <button
          type="button"
          disabled={disabled || waiting}
          className="mt-4 w-full min-h-[44px] touch-manipulation rounded-xl border border-[rgba(201,146,42,0.35)] py-2.5 text-[13px] text-[#f0ede6] transition-colors hover:bg-[#232742] active:bg-[#2a2e48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onOpenSwitch}
        >
          Switch
        </button>
        <button
          type="button"
          disabled={disabled || waiting}
          className="mt-2 w-full min-h-[44px] touch-manipulation rounded-xl border border-white/10 py-2 text-[12px] text-[#8a8fa8] hover:bg-white/5 active:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onSkipTurn}
        >
          End turn
        </button>
      </div>
    )
  }

  const blockInput = disabled || waiting

  return (
    <div
      className={`rounded-2xl border border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.7)] p-3 backdrop-blur-[12px] ${waiting ? 'opacity-85' : ''}`}
    >
      {waiting ? (
        <p className="mb-2 text-center text-[12px] text-[#8a8fa8]">Waiting for opponent…</p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {grid.map((m, i) => {
          const real = m.name !== '—'
          const ppLeft = real ? active.currentPp[m.name] ?? 0 : 0
          const ppMax = real ? active.moves.find((x) => x.name === m.name)?.pp ?? 0 : 0
          const noPp = real && ppLeft <= 0
          const tc = TYPE_COLORS[m.type] ?? TYPE_COLORS.Normal
          const unusable = blockInput || noPp || !real

          return (
            <button
              key={`${m.name}-${i}`}
              type="button"
              disabled={unusable}
              onClick={() => real && onMove(m)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !unusable && real) onMove(m)
              }}
              className={[
                'relative min-h-[118px] touch-manipulation rounded-xl border px-2 pb-6 pt-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]',
                unusable
                  ? 'cursor-not-allowed border-white/10 bg-black/25 opacity-50'
                  : 'border-[rgba(201,146,42,0.2)] bg-[#13152a] active:opacity-90',
              ].join(' ')}
              onMouseEnter={(e) => {
                if (!unusable) e.currentTarget.style.borderColor = tc.glow
              }}
              onMouseLeave={(e) => {
                if (!unusable) e.currentTarget.style.borderColor = 'rgba(201, 146, 42, 0.2)'
              }}
              aria-label={`Use move ${m.name}`}
            >
              <p className="pr-8 font-[family-name:var(--font-cinzel)] text-[13px] font-bold leading-tight text-[#f0ede6]">
                {real ? m.name : '—'}
              </p>
              {real ? (
                <>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: tc.bg, color: tc.text }}
                    >
                      {m.type}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryClass(m.category)}`}>
                      {m.category}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] tabular-nums text-[#c9cddc]">{movePowerAccuracyLine(m)}</p>
                  {m.effect ? (
                    <p className="mt-1 line-clamp-3 text-[9px] leading-snug text-[#8a8fa8]" title={m.effect}>
                      {m.effect}
                    </p>
                  ) : null}
                  <span
                    className={`absolute bottom-1.5 right-2 font-mono text-[11px] tabular-nums ${noPp ? 'text-red-400' : 'text-[#8a8fa8]'}`}
                  >
                    {ppLeft} / {ppMax}
                  </span>
                </>
              ) : null}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        disabled={blockInput}
        className="mt-3 w-full min-h-[44px] touch-manipulation rounded-xl border border-[rgba(201,146,42,0.35)] py-2.5 text-[13px] font-[family-name:var(--font-cinzel)] text-[#c9922a] transition-colors hover:bg-[#232742] active:bg-[#2a2e48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onOpenSwitch}
      >
        Switch
      </button>
    </div>
  )
}
