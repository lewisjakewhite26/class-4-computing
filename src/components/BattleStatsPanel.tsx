import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useTeam } from '../context/TeamContext'
import { customAsCharacter, uncoveredStrongTypes } from '../lib/coverage'
import type { Character } from '../../data/characters'

const COLS = [
  { key: 'total', label: 'Total', color: '#f0b84a' },
  { key: 'hp', label: 'HP', color: '#c84b31' },
  { key: 'atk', label: 'Attack', color: '#e8692a' },
  { key: 'def', label: 'Defence', color: '#4a90d9' },
  { key: 'spatk', label: 'Sp. Atk', color: '#9b5fc0' },
  { key: 'spdef', label: 'Sp. Def', color: '#5aad5a' },
  { key: 'spd', label: 'Speed', color: '#c9922a' },
] as const

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, (value / 255) * 100)
  return (
    <div
      className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-black/45"
      role="img"
      aria-label={`${value} out of 255`}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}55`,
        }}
      />
    </div>
  )
}

export function BattleStatsPanel() {
  const { roster, custom, customSaved } = useTeam()
  const customChar = useMemo(() => {
    if (!customSaved) return null
    return customAsCharacter(custom)
  }, [custom, customSaved])

  const members: Character[] = useMemo(() => {
    const r = roster.filter(Boolean) as Character[]
    if (customChar) return [...r, customChar]
    return r
  }, [roster, customChar])

  const averages = useMemo(() => {
    if (members.length === 0) return null
    const acc = { total: 0, hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 }
    for (const m of members) {
      acc.total += m.total
      acc.hp += m.hp
      acc.atk += m.atk
      acc.def += m.def
      acc.spatk += m.spatk
      acc.spdef += m.spdef
      acc.spd += m.spd
    }
    const n = members.length
    return {
      total: Math.round(acc.total / n),
      hp: Math.round(acc.hp / n),
      atk: Math.round(acc.atk / n),
      def: Math.round(acc.def / n),
      spatk: Math.round(acc.spatk / n),
      spdef: Math.round(acc.spdef / n),
      spd: Math.round(acc.spd / n),
    }
  }, [members])

  const gaps = useMemo(() => uncoveredStrongTypes(members), [members])

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pb-12 pt-4"
    >
      <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-[#f0ede6]">Battle stats</h2>
      {members.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[rgba(201,146,42,0.2)] bg-[#13152a]/40 p-6 text-[13px] text-[#8a8fa8]">
          Add characters to your team to compare stats.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.65)] backdrop-blur-md">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[rgba(201,146,42,0.15)] text-left text-[#8a8fa8]">
                  <th className="sticky left-0 z-10 bg-[#13152a]/95 px-3 py-3 font-medium backdrop-blur">Name</th>
                  {COLS.map((c) => (
                    <th key={c.key} className="px-2 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[#f0ede6]">
                {members.map((m) => (
                  <tr key={m.id + m.name} className="border-b border-[rgba(201,146,42,0.08)]">
                    <td className="sticky left-0 z-10 bg-[#0d0e1a]/90 px-3 py-2 font-[family-name:var(--font-cinzel)] backdrop-blur">
                      {m.name}
                    </td>
                    {COLS.map((col) => (
                      <td key={col.key} className="px-2 py-2 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono tabular-nums">{m[col.key]}</span>
                          {col.key !== 'total' && <Bar value={m[col.key]} color={col.color} />}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                {averages && (
                  <tr className="bg-[rgba(201,146,42,0.12)] font-semibold text-[#f0b84a]">
                    <td className="sticky left-0 z-10 px-3 py-3 backdrop-blur">Team average</td>
                    {COLS.map((col) => (
                      <td key={col.key} className="px-2 py-3 font-mono tabular-nums">
                        {averages[col.key]}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <section aria-label="Type matchups">
            <h3 className="mb-3 font-[family-name:var(--font-cinzel)] text-lg text-[#f0ede6]">
              Type matchup notes
            </h3>
            <p className="mb-4 text-[13px] text-[#8a8fa8]">
              Green chips are types this Mythmon hits for super effective damage (×2) in battle. Red chips are
              types that resist it (×0.5). Everything else is neutral (×1). Dual typings can stack to ×4 super
              effective or ×0.25 resisted.
            </p>
            <div className="space-y-4">
              {members.map((m) => (
                <div
                  key={m.id + m.name}
                  className="rounded-xl border border-[rgba(201,146,42,0.12)] bg-[#13152a]/70 p-3"
                >
                  <p className="mb-2 font-[family-name:var(--font-cinzel)] text-[14px] text-[#f0ede6]">
                    {m.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.strong.map((t) => (
                      <span
                        key={`s-${t}`}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-950/40 px-2 py-0.5 text-[13px] text-emerald-200"
                      >
                        <span className="font-mono text-emerald-400">2×</span>
                        {t}
                      </span>
                    ))}
                    {m.weak.map((t) => (
                      <span
                        key={`w-${t}`}
                        className="inline-flex items-center gap-1 rounded-full border border-red-500/35 bg-red-950/35 px-2 py-0.5 text-[13px] text-red-200"
                      >
                        <span className="font-mono text-red-300">0.5×</span>
                        {t}
                      </span>
                    ))}
                    {m.strong.length === 0 && m.weak.length === 0 && (
                      <span className="text-[13px] text-[#8a8fa8]">Custom — add strengths in your imagination.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          {gaps.length > 0 && (
            <div
              className="rounded-xl border border-amber-500/40 bg-amber-950/25 px-4 py-3 text-[13px] text-amber-100"
              role="alert"
            >
              <strong className="text-amber-200">Coverage gap:</strong> Your team has no one strong against:{' '}
              {gaps.join(', ')}.
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
