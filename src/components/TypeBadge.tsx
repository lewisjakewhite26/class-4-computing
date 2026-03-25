import { TYPE_COLORS } from '../../data/characters'

export function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type] ?? TYPE_COLORS.Normal
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[13px] font-medium tracking-wide min-h-[26px]"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        boxShadow: `0 0 8px ${c.glow}33`,
      }}
      title={type}
    >
      {type}
    </span>
  )
}
