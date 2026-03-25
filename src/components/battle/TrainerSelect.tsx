import { motion } from 'framer-motion'
import type { Character } from '../../../data/characters'
import { CHARACTERS, TYPE_COLORS } from '../../../data/characters'
import type { Trainer } from '../../data/trainers'
import { TRAINERS } from '../../data/trainers'
import { TypeBadge } from '../TypeBadge'

const RARITY_RING: Record<string, string> = {
  Legendary: '#c9922a',
  Rare: '#378ADD',
  Common: '#5a6e5a',
}

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

function isTrainerUnlocked(trainer: Trainer, defeated: number[]): boolean {
  if (trainer.id === 1) return true
  return defeated.includes(trainer.id - 1)
}

function SwordRow({ difficulty }: { difficulty: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`Difficulty ${difficulty} of 5`}>
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <span
          key={n}
          className={`text-[14px] ${n <= difficulty ? 'text-[#c9922a]' : 'text-[#3a3d52]'}`}
          aria-hidden
        >
          ⚔
        </span>
      ))}
    </div>
  )
}

export function TrainerSelect({
  playerTeam,
  defeatedIds,
  onChallenge,
  flashColor,
}: {
  playerTeam: Character[]
  defeatedIds: number[]
  onChallenge: (t: Trainer) => void
  flashColor: string | null
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0d0e1a] px-4 pb-16 pt-6 text-[#f0ede6]">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, #1a1035 0%, #0d0e1a 62%, #0d0e1a 100%)',
        }}
      />
      {flashColor ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50"
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: flashColor }}
        />
      ) : null}

      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-center font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-[#c9922a] md:text-3xl">
          Choose Your Opponent
        </h1>
        <div className="mx-auto mt-6 flex max-w-[900px] flex-wrap justify-center gap-2">
          {playerTeam.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-xl border border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.7)] px-3 py-2 backdrop-blur-[12px]"
            >
              <span className="font-[family-name:var(--font-cinzel)] text-[13px] text-[#f0ede6]">{c.name}</span>
              <div className="flex gap-0.5">
                <TypeBadge type={c.type1} />
                <TypeBadge type={c.type2} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {TRAINERS.map((t) => {
            const unlocked = isTrainerUnlocked(t, defeatedIds)
            const teamChars = t.teamIds
              .map((id) => CHARACTERS.find((c) => c.id === id))
              .filter((c): c is Character => c != null)
            return (
              <motion.article
                key={t.id}
                layout
                className="relative flex w-[min(100%,220px)] flex-col rounded-2xl border bg-[rgba(26,29,53,0.7)] p-4 backdrop-blur-[12px]"
                style={{ borderColor: `${t.color}55` }}
              >
                {!unlocked ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/55 backdrop-blur-[2px]">
                    <span className="text-3xl" aria-hidden>
                      🔒
                    </span>
                    <span className="mt-2 text-center text-[12px] text-[#8a8fa8]">Defeat the previous trainer</span>
                  </div>
                ) : null}
                <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-[#f0ede6]">{t.name}</h2>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[#8a8fa8]">{t.title}</p>
                <div className="mt-2">
                  <SwordRow difficulty={t.difficulty} />
                </div>
                <p className="mt-3 flex-1 text-[12px] italic leading-snug text-[#a8adc4]">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-3 flex justify-center gap-1.5">
                  {teamChars.map((c) => {
                    const ring = RARITY_RING[c.rarity] ?? RARITY_RING.Common
                    const tc = TYPE_COLORS[c.type1] ?? TYPE_COLORS.Normal
                    return (
                      <div
                        key={c.id}
                        title={c.name}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-[12px] font-[family-name:var(--font-cinzel)] font-bold text-white"
                        style={{
                          borderColor: ring,
                          background: tc.bg,
                          boxShadow: `0 0 8px ${tc.glow}33`,
                        }}
                      >
                        {initial(c.name)}
                      </div>
                    )
                  })}
                </div>
                <button
                  type="button"
                  disabled={!unlocked}
                  className="mt-4 w-full rounded-xl border border-[rgba(201,146,42,0.35)] bg-[#1a1d35] py-2.5 font-[family-name:var(--font-cinzel)] text-[13px] text-[#c9922a] transition-colors hover:bg-[#232742] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a] disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => unlocked && onChallenge(t)}
                >
                  Challenge
                </button>
              </motion.article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
