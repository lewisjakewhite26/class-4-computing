import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useTeam } from '../context/TeamContext'
import { MoveList } from './MoveList'
import { TypeBadge } from './TypeBadge'
import { toUiMoves } from '../types'

const STAT_ROWS = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: 'Attack' },
  { key: 'def', label: 'Defence' },
  { key: 'spatk', label: 'Sp. Atk' },
  { key: 'spdef', label: 'Sp. Def' },
  { key: 'spd', label: 'Speed' },
] as const

export function MyTeamPanel() {
  const { roster, randomiseTeam } = useTeam()

  const filled = useMemo(() => roster.filter(Boolean), [roster])

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pb-12 pt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-[#f0ede6]">Roster detail</h2>
        <button
          type="button"
          className="min-h-[44px] rounded-xl border border-[rgba(201,146,42,0.35)] bg-[#1a1d35] px-4 py-2 text-[13px] font-medium text-[#f0ede6] transition-colors hover:bg-[#232742] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
          onClick={randomiseTeam}
        >
          Randomise team
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {filled.map((c) =>
          c ? (
            <motion.article
              key={c.id}
              layout
              className="rounded-2xl border border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.7)] p-4 backdrop-blur-[12px]"
              style={{
                boxShadow:
                  c.rarity === 'Legendary'
                    ? '0 0 24px rgba(201, 146, 42, 0.2)'
                    : c.rarity === 'Rare'
                      ? '0 0 18px rgba(56, 120, 200, 0.15)'
                      : '0 0 12px rgba(60, 120, 60, 0.12)',
              }}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-[family-name:var(--font-cinzel)] text-lg text-[#f0ede6]">{c.name}</h3>
                  <p className="text-[13px] text-[#8a8fa8]">
                    {c.role} · {c.domain}
                  </p>
                </div>
                <div className="flex gap-1">
                  <TypeBadge type={c.type1} />
                  <TypeBadge type={c.type2} />
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[rgba(201,146,42,0.1)] bg-[#13152a]/80">
                <table className="w-full min-w-[280px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[rgba(201,146,42,0.12)] text-[#8a8fa8]">
                      <th className="px-3 py-2 font-medium">Stat</th>
                      <th className="px-3 py-2 font-mono font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[#f0ede6]">
                    {STAT_ROWS.map((r) => (
                      <tr key={r.key} className="border-b border-[rgba(201,146,42,0.06)]">
                        <td className="px-3 py-1.5">{r.label}</td>
                        <td className="px-3 py-1.5" aria-label={`${r.label}: ${c[r.key]} out of 255`}>
                          {c[r.key]}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#1a1d35]/80 font-semibold text-[#f0b84a]">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2" aria-label={`Total base stats ${c.total}`}>
                        {c.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {c.moves && c.moves.length > 0 && (
                <div className="mt-6">
                  <h3
                    className="mb-3 font-[family-name:var(--font-cinzel)] text-[14px] tracking-wide text-[#c9922a]"
                    style={{ letterSpacing: '0.5px' }}
                  >
                    Move Set
                  </h3>
                  <MoveList moves={toUiMoves(c.moves)} />
                </div>
              )}
              <p className="mt-2 font-mono text-[12px] text-[#8a8fa8]">Cost {c.cost} ₯</p>
            </motion.article>
          ) : null,
        )}
        {filled.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-[rgba(201,146,42,0.2)] bg-[#13152a]/40 p-6 text-[13px] text-[#8a8fa8]">
            Pick up to four Mythmon from <strong className="text-[#f0ede6]">Team Builder</strong> to see them here.
          </p>
        )}
      </div>
    </motion.div>
  )
}
