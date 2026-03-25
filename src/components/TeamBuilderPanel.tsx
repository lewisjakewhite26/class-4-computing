import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { useTeam } from '../context/TeamContext'
import { BUDGET } from '../../data/characters'
import { TypeBadge } from './TypeBadge'

const STAT_ROWS = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: 'Attack' },
  { key: 'def', label: 'Defence' },
  { key: 'spatk', label: 'Sp. Atk' },
  { key: 'spdef', label: 'Sp. Def' },
  { key: 'spd', label: 'Speed' },
] as const

function sumCustomStats(c: {
  hp: number
  atk: number
  def: number
  spatk: number
  spdef: number
  spd: number
}) {
  return STAT_ROWS.reduce((s, r) => s + c[r.key], 0)
}

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

const slotShellClass =
  'relative flex h-[160px] w-full max-w-[200px] flex-col rounded-xl border-2 border-dashed border-[rgba(201,146,42,0.4)] bg-[rgba(26,29,53,0.85)] transition-colors'

export function TeamBuilderPanel({
  onOpenPicker,
}: {
  onOpenPicker: (slotIndex: number) => void
}) {
  const {
    roster,
    rosterCount,
    custom,
    customSaved,
    setCustom,
    saveCustomToTeam,
    removeCustomFromTeam,
    removeFromSlot,
    rosterSpent,
  } = useTeam()

  const cap = Math.max(0, BUDGET - rosterSpent)
  const totalCustom = sumCustomStats(custom)

  const maxFor = useCallback(
    (key: (typeof STAT_ROWS)[number]['key']) => {
      const others = totalCustom - custom[key]
      return Math.min(255, cap - others)
    },
    [cap, custom, totalCustom],
  )

  const onStatInput = (key: (typeof STAT_ROWS)[number]['key'], raw: number) => {
    const others = totalCustom - custom[key]
    const maxV = Math.min(255, cap - others)
    const v = Math.max(10, Math.min(maxV, Math.round(raw)))
    setCustom({ [key]: v })
  }

  const unlocked = rosterCount >= 1
  const canSave =
    unlocked && custom.name.trim().length > 0 && sumCustomStats(custom) <= cap

  const renderRosterSlot = (index: number) => {
    const c = roster[index]
    if (!c) {
      return (
        <button
          type="button"
          className={`${slotShellClass} cursor-pointer items-center justify-center px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]`}
          onClick={() => onOpenPicker(index)}
        >
          <span className="text-5xl font-light leading-none text-[#c9922a]" aria-hidden>
            +
          </span>
          <span className="mt-2 text-center text-[13px] text-[#8a8fa8]">Add Mythmon</span>
        </button>
      )
    }

    return (
      <div
        className={`${slotShellClass} flex flex-col border-solid border-[rgba(201,146,42,0.25)] p-2`}
      >
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-lg leading-none text-[#8a8fa8] hover:text-[#f0ede6]"
            onClick={() => removeFromSlot(index)}
            aria-label={`Remove ${c.name}`}
          >
            ×
          </button>
        </div>
        <button
          type="button"
          className="flex min-h-0 flex-1 flex-col items-center px-1 pb-1 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
          onClick={() => onOpenPicker(index)}
          aria-label={`Change ${c.name}`}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-[#f0ede6]"
            style={{
              borderColor: 'rgba(201, 146, 42, 0.35)',
              background: 'linear-gradient(145deg, #1a1d35, #13152a)',
            }}
          >
            {initial(c.name)}
          </div>
          <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-cinzel)] text-[14px] font-semibold text-[#f0ede6]">
            {c.name}
          </h3>
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            <TypeBadge type={c.type1} />
            <TypeBadge type={c.type2} />
          </div>
          <span className="mt-auto rounded-full border border-[rgba(201,146,42,0.25)] bg-[#1a1d35] px-2 py-0.5 font-mono text-[12px] text-[#f0b84a]">
            {c.cost} ₯
          </span>
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="pb-10 pt-4"
    >
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8">
        <div className="grid w-full grid-cols-2 justify-items-center gap-4 xl:grid-cols-4 xl:max-w-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex justify-center">
              {renderRosterSlot(i)}
            </div>
          ))}
        </div>

        <section
          className={[
            'w-full max-w-2xl rounded-2xl border-2 border-dashed border-[rgba(201,146,42,0.45)] bg-[rgba(26,29,53,0.55)] p-5 backdrop-blur-md',
            !unlocked ? 'pointer-events-none opacity-50' : '',
          ].join(' ')}
          aria-disabled={!unlocked}
        >
          <h3 className="font-[family-name:var(--font-cinzel)] text-lg text-[#f0b84a]">Your Creation</h3>
          <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-[#8a8fa8]">
            Use your leftover Drachma to design your own mythical creature. Each point in a stat costs 1 Drachma. Sliders
            use the full 10–255 scale so you can see how strong each stat is; your budget still caps how high you can go.
            When you are happy, press <span className="text-[#f0ede6]">Save to team</span> to add them as your fifth team
            member (sidebar slot 5 and Battle Stats).
          </p>
          {!unlocked && (
            <p className="mt-2 text-[13px] text-amber-300/90">Add at least one Mythmon above to unlock this.</p>
          )}
          {customSaved && (
            <p className="mt-2 rounded-lg border border-[rgba(201,146,42,0.25)] bg-[#1a1d35]/80 px-3 py-2 text-[13px] text-[#f0b84a]">
              On your team — you can still edit stats or name, then save again to update.
            </p>
          )}
          <label className="mt-4 block text-[13px] text-[#8a8fa8]">
            Name
            <input
              type="text"
              value={custom.name}
              onChange={(e) => setCustom({ name: e.target.value })}
              disabled={!unlocked}
              maxLength={40}
              placeholder="Name your creature"
              className="mt-1 w-full min-h-[44px] rounded-xl border border-[rgba(201,146,42,0.2)] bg-[#13152a] px-3 py-2 text-[13px] text-[#f0ede6] placeholder:text-[#5c6078] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a] disabled:opacity-60"
            />
          </label>
          <div className="mt-4 space-y-4">
            {STAT_ROWS.map((r) => {
              const v = custom[r.key]
              const maxAffordable = maxFor(r.key)
              const thumb = Math.min(255, Math.max(10, Math.min(v, maxAffordable)))
              return (
                <div key={r.key}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <label htmlFor={`tb-stat-${r.key}`} className="text-[#f0ede6]">
                      {r.label}
                    </label>
                    <span className="font-mono text-[#f0b84a]" aria-live="polite">
                      {v}
                    </span>
                  </div>
                  <input
                    id={`tb-stat-${r.key}`}
                    type="range"
                    min={10}
                    max={255}
                    step={1}
                    value={thumb}
                    disabled={!unlocked}
                    aria-valuemin={10}
                    aria-valuemax={255}
                    aria-valuenow={v}
                    aria-label={`${r.label}: value ${v} on a 10 to 255 scale; can spend up to ${maxAffordable} on this stat with current budget`}
                    className="h-2 w-full cursor-pointer accent-[#c9922a] disabled:cursor-not-allowed"
                    onChange={(e) => onStatInput(r.key, Number(e.target.value))}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[rgba(201,146,42,0.12)] pt-4">
            <button
              type="button"
              className="min-h-[44px] rounded-xl border border-[rgba(201,146,42,0.45)] bg-[#c9922a] px-5 py-2.5 text-[13px] font-semibold text-[#0d0e1a] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b84a]"
              disabled={!canSave}
              onClick={saveCustomToTeam}
            >
              {customSaved ? 'Save changes to team' : 'Save to team'}
            </button>
            {customSaved && (
              <button
                type="button"
                className="min-h-[44px] rounded-xl border border-[rgba(201,146,42,0.25)] bg-transparent px-4 py-2.5 text-[13px] font-medium text-[#8a8fa8] transition-colors hover:border-red-500/35 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
                onClick={removeCustomFromTeam}
              >
                Remove from team
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-[#8a8fa8]">
            <p>
              Stat total:{' '}
              <span className="font-mono font-semibold text-[#f0ede6]" aria-live="polite">
                {totalCustom}
              </span>
            </p>
            <p>
              Budget for custom:{' '}
              <span className="font-mono text-[#f0b84a]">{cap} ₯</span> · Remaining after stats:{' '}
              <span className="font-mono text-[#f0ede6]">{cap - totalCustom} ₯</span>
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  )
}
