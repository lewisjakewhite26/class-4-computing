import type { BattlePokemon } from '../../engine/battleEngine'
import type { Trainer } from '../../data/trainers'
import { BattleLog } from './BattleLog'
import { CharacterAvatar } from './CharacterAvatar'
import { HpBar } from './HpBar'
import { MoveButtons } from './MoveButtons'
import { SwitchPanel } from './SwitchPanel'
import type { BattleLogEntry } from '../../engine/battleEngine'

const STATUS_STYLE: Record<string, { label: string; bg: string }> = {
  paralysed: { label: 'PAR', bg: '#EF9F27' },
  poisoned: { label: 'PSN', bg: '#7F77DD' },
  burned: { label: 'BRN', bg: '#D85A30' },
  asleep: { label: 'SLP', bg: '#378ADD' },
  confused: { label: 'CFN', bg: '#D4537E' },
  none: { label: '', bg: 'transparent' },
}

function StatusBadge({ status }: { status: BattlePokemon['status'] }) {
  if (status === 'none') return null
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.none
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  )
}

export function BattleArena({
  trainer,
  playerActive,
  aiActive,
  playerTeam,
  playerActiveIndex,
  turn,
  log,
  waiting,
  aiThinking,
  switchOpen,
  switchForced,
  playerShake,
  aiShake,
  playerFaintedVisual,
  aiFaintedVisual,
  playerHpFlash,
  aiHpFlash,
  onMove,
  onSkipTurn,
  onOpenSwitch,
  onCloseSwitch,
  onSwitchPick,
}: {
  trainer: Trainer
  playerActive: BattlePokemon
  aiActive: BattlePokemon
  playerTeam: BattlePokemon[]
  playerActiveIndex: number
  turn: number
  log: BattleLogEntry[]
  waiting: boolean
  aiThinking: boolean
  switchOpen: boolean
  switchForced: boolean
  playerShake: number
  aiShake: number
  playerFaintedVisual: boolean
  aiFaintedVisual: boolean
  playerHpFlash: number
  aiHpFlash: number
  onMove: (m: import('../../engine/battleEngine').BattleMove) => void
  onSkipTurn: () => void
  onOpenSwitch: () => void
  onCloseSwitch: () => void
  onSwitchPick: (index: number) => void
}) {
  const asleep = playerActive.status === 'asleep'

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0e1a] text-[#f0ede6]">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, #1a1035 0%, #0d0e1a 62%, #0d0e1a 100%)',
        }}
      />

      {/* AI half */}
      <section className="flex min-h-[38vh] flex-col justify-end px-4 pb-4 pt-8 min-[1200px]:px-8">
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-end gap-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className="rounded-full border px-3 py-1 font-[family-name:var(--font-cinzel)] text-[12px]"
              style={{ borderColor: trainer.color, color: trainer.color }}
            >
              {trainer.name}
            </span>
            <span className="font-[family-name:var(--font-cinzel)] text-[15px] text-[#f0ede6]">
              {aiActive.name}{' '}
              <span className="text-[#8a8fa8]">Lv.50</span>
            </span>
          </div>
          <div className="flex w-full max-w-md min-w-0 flex-col items-stretch gap-2">
            <div className="flex w-full min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <HpBar
                  current={aiActive.currentHp}
                  max={aiActive.maxHp}
                  showNumbers
                  flashKey={aiHpFlash}
                />
              </div>
              <StatusBadge status={aiActive.status} />
            </div>
          </div>
          <CharacterAvatar
            name={aiActive.name}
            type1={aiActive.type1}
            align="right"
            shakeKey={aiShake}
            fainted={aiFaintedVisual}
            pulse={aiThinking}
          />
        </div>
      </section>

      <div className="h-px shrink-0 bg-[rgba(201,146,42,0.12)]" />

      {/* Player half */}
      <section className="flex min-h-[32vh] flex-col justify-start px-4 pt-4 min-[1200px]:px-8">
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-start gap-3">
          <CharacterAvatar
            name={playerActive.name}
            type1={playerActive.type1}
            align="left"
            shakeKey={playerShake}
            fainted={playerFaintedVisual}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-cinzel)] text-[15px] text-[#f0ede6]">
              {playerActive.name}{' '}
              <span className="text-[#8a8fa8]">Lv.50</span>
            </span>
            <StatusBadge status={playerActive.status} />
          </div>
          <div className="w-full max-w-md min-w-0">
            <div className="min-w-0 w-full">
              <HpBar
                current={playerActive.currentHp}
                max={playerActive.maxHp}
                showNumbers
                flashKey={playerHpFlash}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Action panel */}
      <div className="mt-auto border-t border-[rgba(201,146,42,0.12)] bg-[rgba(13,14,26,0.6)] px-4 py-4 min-[1200px]:px-8">
        <p className="mb-2 text-center text-[11px] text-[#8a8fa8]">Turn {turn}</p>
        <div className="mx-auto grid max-w-[1000px] gap-4 min-[900px]:grid-cols-2">
          <BattleLog entries={log} />
          <div>
            {switchOpen ? (
              <SwitchPanel
                team={playerTeam}
                activeIndex={playerActiveIndex}
                forced={switchForced}
                onPick={onSwitchPick}
                onBack={onCloseSwitch}
              />
            ) : (
              <MoveButtons
                active={playerActive}
                disabled={switchForced}
                waiting={waiting}
                asleep={asleep}
                onMove={onMove}
                onOpenSwitch={onOpenSwitch}
                onSkipTurn={onSkipTurn}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
