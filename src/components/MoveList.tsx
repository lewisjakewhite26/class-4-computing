import type { UiCharacterMove } from '../types'
import { TypeBadge } from './TypeBadge'

const CATEGORY_STYLES: Record<
  UiCharacterMove['category'],
  { bg: string; text: string }
> = {
  Physical: { bg: '#993C1D', text: '#FAECE7' },
  Special: { bg: '#3C3489', text: '#EEEDFE' },
  Status: { bg: '#444441', text: '#D3D1C7' },
}

function formatNum(n: number | null) {
  return n === null ? '—' : String(n)
}

function formatAcc(n: number | null) {
  return n === null ? '—' : `${n}%`
}

function PpPips({ pp }: { pp: number }) {
  const cap = 15
  const shown = Math.min(pp, cap)
  const overflow = pp > cap
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${pp} PP`}>
      {Array.from({ length: shown }, (_, i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9922a]"
          aria-hidden
        />
      ))}
      {overflow && (
        <span className="ml-0.5 text-[11px] font-medium text-[#c9922a]" aria-hidden>
          +
        </span>
      )}
    </span>
  )
}

export function MoveList({ moves }: { moves: UiCharacterMove[] }) {
  if (!moves.length) return null

  return (
    <div
      className="backdrop-blur-[12px]"
      style={{
        background: 'rgba(26, 29, 53, 0.7)',
        border: '1px solid rgba(201, 146, 42, 0.15)',
        borderRadius: 12,
        padding: '1rem',
      }}
    >
      <ul className="m-0 list-none p-0">
        {moves.map((m, i) => {
          const cat = CATEGORY_STYLES[m.category]
          return (
            <li
              key={`${m.name}-${i}`}
              style={
                i > 0
                  ? { borderTop: '0.5px solid rgba(201, 146, 42, 0.1)' }
                  : undefined
              }
            >
              <div className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span className="font-[family-name:var(--font-cinzel)] text-[13px] font-bold text-[#f0ede6]">
                    {m.name}
                  </span>
                  <TypeBadge type={m.type} />
                  <span
                    className="inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: cat.bg, color: cat.text }}
                  >
                    {m.category}
                  </span>
                  <span className="font-mono text-[12px] text-[#f0ede6]" aria-label={`Power ${formatNum(m.power)}`}>
                    {formatNum(m.power)}
                  </span>
                  <span className="font-mono text-[12px] text-[#8a8fa8]" aria-hidden>
                    ·
                  </span>
                  <span
                    className="font-mono text-[12px] text-[#f0ede6]"
                    aria-label={`Accuracy ${formatAcc(m.accuracy)}`}
                  >
                    {formatAcc(m.accuracy)}
                  </span>
                  <span className="font-mono text-[12px] text-[#8a8fa8]" aria-hidden>
                    ·
                  </span>
                  <PpPips pp={m.pp} />
                </div>
                <p className="mt-1.5 text-[12px] italic leading-snug text-[#8a8fa8]">{m.effect}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
