import { motion } from 'framer-motion'
import type { Trainer } from '../../data/trainers'
import type { PerfRow } from '../../lib/battlePerfRows'
import { effectivenessColor } from '../../engine/battleEngine'
import { TypeBadge } from '../TypeBadge'

export type { PerfRow } from '../../lib/battlePerfRows'

export interface EduCard {
  id: string
  attacker: string
  move: string
  moveType: string
  defender: string
  defTypes: string
  mult: number
  lines: string[]
}

export function BattleOver({
  won,
  trainer,
  perfRows,
  eduCards,
  nextTrainerId,
  onBattleAgain,
  onChooseTrainer,
  onHome,
  onNextTrainer,
}: {
  won: boolean
  trainer: Trainer
  perfRows: PerfRow[]
  eduCards: EduCard[]
  nextTrainerId: number | null
  onBattleAgain: () => void
  onChooseTrainer: () => void
  onHome: () => void
  onNextTrainer: () => void
}) {
  const quote = won ? trainer.defeatQuote : trainer.quote

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0e1a] px-4 py-10 text-[#f0ede6]">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, #1a1035 0%, #0d0e1a 62%, #0d0e1a 100%)',
        }}
      />
      <div className="mx-auto max-w-[720px]">
        <motion.header
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center"
        >
          <h1
            className={`font-[family-name:var(--font-cinzel)] text-4xl font-bold md:text-5xl ${won ? 'text-[#c9922a]' : 'text-[#b85a5a]'}`}
          >
            {won ? 'VICTORY!' : 'DEFEATED...'}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] italic leading-relaxed text-[#a8adc4]">
            &ldquo;{quote}&rdquo;
          </p>
        </motion.header>

        <section className="mt-10 rounded-2xl border border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.7)] p-4 backdrop-blur-[12px]">
          <h2 className="font-[family-name:var(--font-cinzel)] text-lg text-[#f0ede6]">Performance</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-b border-[rgba(201,146,42,0.15)] text-[#8a8fa8]">
                  <th className="py-2 pr-2 font-medium">Mythmon</th>
                  <th className="py-2 pr-2 font-medium">Dealt</th>
                  <th className="py-2 pr-2 font-medium">Taken</th>
                  <th className="py-2 pr-2 font-medium">Fainted</th>
                  <th className="py-2 font-medium">Best hit</th>
                </tr>
              </thead>
              <tbody>
                {perfRows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 pr-2">
                      <span className="font-[family-name:var(--font-cinzel)] text-[13px] text-[#f0ede6]">{r.name}</span>
                      <div className="mt-0.5 flex flex-wrap gap-0.5">
                        <TypeBadge type={r.type1} />
                        <TypeBadge type={r.type2} />
                      </div>
                    </td>
                    <td className="py-2 pr-2 font-mono tabular-nums">{r.damageDealt}</td>
                    <td className="py-2 pr-2 font-mono tabular-nums">{r.damageTaken}</td>
                    <td className="py-2 pr-2">
                      {r.fainted ? `Yes (turn ${r.faintedTurn ?? '?'})` : `No (${r.hpRemaining ?? 0} HP)`}
                    </td>
                    <td className="py-2">
                      {r.bestMove ? `${r.bestMove} (${r.bestMoveDamage})` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {eduCards.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-[#c9922a]">What happened and why</h2>
            <ul className="mt-4 space-y-3">
              {eduCards.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-[rgba(201,146,42,0.12)] bg-[rgba(26,29,53,0.55)] p-3 pl-4 backdrop-blur-[12px]"
                  style={{ borderLeftWidth: 4, borderLeftColor: effectivenessColor(c.mult) }}
                >
                  {c.lines.map((line, i) => (
                    <p key={i} className="text-[13px] leading-snug text-[#d8dae8]">
                      {line}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-10 flex flex-col gap-3">
          {won && nextTrainerId != null ? (
            <button
              type="button"
              className="w-full rounded-xl border border-[rgba(201,146,42,0.45)] bg-gradient-to-r from-[#2a2540] to-[#1a1d35] py-3 font-[family-name:var(--font-cinzel)] text-[15px] font-semibold text-[#c9922a] transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
              onClick={onNextTrainer}
            >
              Challenge Next Trainer
            </button>
          ) : null}
          <button
            type="button"
            className="w-full rounded-xl border border-[rgba(201,146,42,0.35)] py-2.5 text-[13px] text-[#f0ede6] transition-colors hover:bg-[#232742] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
            onClick={onBattleAgain}
          >
            Battle Again
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-[rgba(201,146,42,0.35)] py-2.5 text-[13px] text-[#f0ede6] transition-colors hover:bg-[#232742] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
            onClick={onChooseTrainer}
          >
            Choose Different Trainer
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-white/10 py-2.5 text-[13px] text-[#8a8fa8] transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
            onClick={onHome}
          >
            Back to Team Builder
          </button>
        </div>
      </div>
    </div>
  )
}
