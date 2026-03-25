import { useEffect, useRef } from 'react'
import type { BattleLogEntry } from '../../engine/battleEngine'

function lineColor(entry: BattleLogEntry): string {
  if (entry.color) return entry.color
  switch (entry.type) {
    case 'faint':
      return '#E24B4A'
    case 'effectiveness':
      return entry.text.includes('super') ? '#f0b84a' : '#8a8fa8'
    case 'status':
      return '#EF9F27'
    case 'info':
      return '#8a8fa8'
    default:
      return '#f0ede6'
  }
}

export function BattleLog({ entries }: { entries: BattleLogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div
      className="h-[160px] overflow-y-auto rounded-2xl border border-[rgba(201,146,42,0.15)] bg-[rgba(13,14,26,0.95)] p-3 font-[family-name:var(--font-inter)] text-[13px] leading-snug backdrop-blur-[12px]"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {entries.length === 0 ? (
        <p className="text-[#8a8fa8]">Battle log…</p>
      ) : (
        entries.map((e) => (
          <p key={e.id} className="mb-1 break-words" style={{ color: lineColor(e) }}>
            {e.text}
          </p>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}
