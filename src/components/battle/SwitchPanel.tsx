import type { BattlePokemon } from '../../engine/battleEngine'
import { TYPE_COLORS } from '../../../data/characters'
import { TypeBadge } from '../TypeBadge'
import { HpBar } from './HpBar'

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

export function SwitchPanel({
  team,
  activeIndex,
  forced,
  onPick,
  onBack,
}: {
  team: BattlePokemon[]
  activeIndex: number
  forced: boolean
  onPick: (index: number) => void
  onBack: () => void
}) {
  return (
    <div className="rounded-2xl border border-[rgba(201,146,42,0.15)] bg-[rgba(26,29,53,0.7)] p-3 backdrop-blur-[12px]">
      {forced ? (
        <p className="mb-3 text-center font-[family-name:var(--font-cinzel)] text-[15px] text-[#f0b84a]">
          Choose your next Mythmon!
        </p>
      ) : (
        <p className="mb-3 font-[family-name:var(--font-cinzel)] text-[14px] text-[#f0ede6]">Switch</p>
      )}
      <ul className="space-y-2">
        {team.map((mon, i) => {
          const isActive = i === activeIndex
          const fainted = mon.currentHp <= 0
          const selectable = !isActive && !fainted
          const tc = TYPE_COLORS[mon.type1] ?? TYPE_COLORS.Normal
          return (
            <li key={`${mon.id}-${i}`}>
              <button
                type="button"
                disabled={!selectable}
                onClick={() => selectable && onPick(i)}
                className={[
                  'flex w-full items-center gap-3 rounded-xl border px-2 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]',
                  selectable
                    ? 'border-[rgba(201,146,42,0.2)] bg-[#13152a] hover:border-[#c9922a]/50'
                    : 'cursor-not-allowed border-white/5 bg-black/20 opacity-50',
                ].join(' ')}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-[family-name:var(--font-cinzel)] font-semibold text-white"
                  style={{
                    backgroundColor: fainted ? '#2a2a2a' : tc.bg,
                    borderColor: fainted ? '#444' : `${tc.glow}88`,
                  }}
                >
                  {fainted ? '×' : initial(mon.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-cinzel)] text-[13px] text-[#f0ede6]">{mon.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-0.5">
                    <TypeBadge type={mon.type1} />
                    <TypeBadge type={mon.type2} />
                  </div>
                  <div className="mt-1.5">
                    <HpBar current={mon.currentHp} max={mon.maxHp} showNumbers />
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      {!forced ? (
        <button
          type="button"
          className="mt-3 w-full rounded-xl border border-[rgba(201,146,42,0.35)] py-2.5 text-[13px] text-[#f0ede6] transition-colors hover:bg-[#232742] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9922a]"
          onClick={onBack}
        >
          Back
        </button>
      ) : null}
    </div>
  )
}
