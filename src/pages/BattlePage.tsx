import { useCallback, useEffect, useReducer, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Character } from '../../data/characters'
import { CHARACTERS } from '../../data/characters'
import { BattleArena } from '../components/battle/BattleArena'
import { BattleOver, type EduCard } from '../components/battle/BattleOver'
import { buildPerfRows } from '../lib/battlePerfRows'
import { TrainerSelect } from '../components/battle/TrainerSelect'
import { TRAINERS, type Trainer } from '../data/trainers'
import {
  applyStatusFromMove,
  calcConfusionSelfDamage,
  calcDamage,
  characterToBattlePokemon,
  getDifficultyStatMultiplier,
  effectivenessColor,
  effectivenessLabel,
  formatMoveSummary,
  missesAccuracy,
  selectAiMove,
  STRUGGLE_MOVE,
  statusDamageBurn,
  statusDamagePoison,
  type BattleLogEntry,
  type BattleMove,
  type BattlePokemon,
} from '../engine/battleEngine'

type Phase = 'trainer-select' | 'battle' | 'player-switch' | 'battle-over'

type PerfInner = {
  damageDealt: number
  damageTaken: number
  bestMove: string | null
  bestMoveDamage: number
  faintedTurn: number | null
  finalHp: number | null
}

interface FullState {
  phase: Phase
  trainer: Trainer | null
  playerSource: Character[]
  playerTeam: BattlePokemon[]
  aiTeam: BattlePokemon[]
  playerActiveIndex: number
  aiActiveIndex: number
  turn: number
  log: BattleLogEntry[]
  logSeq: number
  waiting: boolean
  aiThinking: boolean
  switchOpen: boolean
  switchForced: boolean
  outcome: 'win' | 'loss' | null
  flashColor: string | null
  defeatedIds: number[]
  perf: Record<number, PerfInner>
  edu: EduCard[]
  playerShake: number
  aiShake: number
  playerFaintVisual: boolean
  aiFaintVisual: boolean
  playerHpFlash: number
  aiHpFlash: number
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

function readDefeated(): number[] {
  try {
    const raw = localStorage.getItem('mythmon_defeated')
    if (!raw) return []
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : []
  } catch {
    return []
  }
}

function writeDefeatedAdd(id: number) {
  const cur = readDefeated()
  if (cur.includes(id)) return
  cur.push(id)
  localStorage.setItem('mythmon_defeated', JSON.stringify(cur))
}

function initPerf(source: Character[]): Record<number, PerfInner> {
  const o: Record<number, PerfInner> = {}
  for (const c of source) {
    o[c.id] = {
      damageDealt: 0,
      damageTaken: 0,
      bestMove: null,
      bestMoveDamage: 0,
      faintedTurn: null,
      finalHp: c.hp,
    }
  }
  return o
}

function reducer(_: FullState, action: { type: 'SET'; payload: FullState }): FullState {
  return action.payload
}

function cloneState(s: FullState): FullState {
  return structuredClone(s)
}

function getActive(s: FullState) {
  return {
    player: s.playerTeam[s.playerActiveIndex]!,
    ai: s.aiTeam[s.aiActiveIndex]!,
  }
}

export default function BattlePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navState = location.state as { playerTeam?: Character[] } | null
  const playerSource = (navState?.playerTeam ?? []).filter(Boolean) as Character[]

  const initial: FullState = {
    phase: 'trainer-select',
    trainer: null,
    playerSource,
    playerTeam: [],
    aiTeam: [],
    playerActiveIndex: 0,
    aiActiveIndex: 0,
    turn: 1,
    log: [],
    logSeq: 0,
    waiting: false,
    aiThinking: false,
    switchOpen: false,
    switchForced: false,
    outcome: null,
    flashColor: null,
    defeatedIds: readDefeated(),
    perf: initPerf(playerSource),
    edu: [],
    playerShake: 0,
    aiShake: 0,
    playerFaintVisual: false,
    aiFaintVisual: false,
    playerHpFlash: 0,
    aiHpFlash: 0,
  }

  const [state, dispatch] = useReducer(reducer, initial)
  const stateRef = useRef(state)
  const processing = useRef(false)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const setS = useCallback((updater: (prev: FullState) => FullState) => {
    dispatch({ type: 'SET', payload: updater(stateRef.current) })
  }, [])

  const addLog = useCallback(
    async (s: FullState, turnLabel: number, entries: Omit<BattleLogEntry, 'id'>[]) => {
      let next = cloneState(s)
      for (const e of entries) {
        const logSeq = next.logSeq + 1
        next = {
          ...next,
          logSeq,
          log: [
            ...next.log,
            {
              id: logSeq,
              type: e.type,
              text: `[Turn ${turnLabel}] ${e.text}`,
              color: e.color,
            },
          ],
        }
        dispatch({ type: 'SET', payload: next })
        await sleep(50)
      }
      return next
    },
    [],
  )

  /** Record type matchup for Battle Over when notable */
  const pushEdu = (s: FullState, args: EduCard): FullState => {
    const next = cloneState(s)
    const exists = next.edu.some((x) => x.id === args.id)
    if (exists) return next
    next.edu = [...next.edu, args]
    return next
  }

  const recordDamageDealt = (s: FullState, attackerId: number, moveName: string, dmg: number): FullState => {
    const next = cloneState(s)
    const p = next.perf[attackerId]
    if (!p) return next
    p.damageDealt += dmg
    if (dmg > p.bestMoveDamage) {
      p.bestMoveDamage = dmg
      p.bestMove = moveName
    }
    next.perf[attackerId] = p
    return next
  }

  const recordDamageTaken = (s: FullState, targetId: number, dmg: number): FullState => {
    const next = cloneState(s)
    const p = next.perf[targetId]
    if (!p) return next
    p.damageTaken += dmg
    next.perf[targetId] = p
    return next
  }

  const applyEduForHit = (
    s: FullState,
    attackerName: string,
    move: BattleMove,
    defenderName: string,
    defender: BattlePokemon,
    mult: number,
  ): FullState => {
    if (mult === 1) return s
    const defTypes = [defender.type1, defender.type2].filter(Boolean).join(' / ')
    const id = `${attackerName}-${move.name}-${defenderName}-${mult}-${s.logSeq}`
    let line2 = ''
    if (mult >= 2) {
      line2 =
        mult >= 4
          ? `${move.type} lines up especially well against both of ${defenderName}'s typings — extra damage!`
          : `${move.type} is super effective against part of ${defenderName}'s typing — more damage!`
    } else {
      line2 = `${move.type} is not very effective against part of ${defenderName}'s typing — less damage.`
    }
    return pushEdu(s, {
      id,
      attacker: attackerName,
      move: move.name,
      moveType: move.type,
      defender: defenderName,
      defTypes,
      mult,
      lines: [
        `${attackerName} used ${move.name} (${move.type}) against ${defenderName} (${defTypes}).`,
        line2,
      ],
    })
  }

  const executeAttack = async (
    s0: FullState,
    roundTurn: number,
    attackerSide: 'player' | 'ai',
    defenderSide: 'player' | 'ai',
    move: BattleMove,
  ): Promise<FullState> => {
    let s = cloneState(s0)
    const aIdx = attackerSide === 'player' ? s.playerActiveIndex : s.aiActiveIndex
    const dIdx = defenderSide === 'player' ? s.playerActiveIndex : s.aiActiveIndex
    let attacker = s[attackerSide === 'player' ? 'playerTeam' : 'aiTeam'][aIdx]!
    let defender = s[defenderSide === 'player' ? 'playerTeam' : 'aiTeam'][dIdx]!

    const attName = attacker.name
    const defName = defender.name

    if (attacker.status === 'asleep') {
      s = await addLog(s, roundTurn, [
        { type: 'info', text: `${attName} is fast asleep!`, color: '#378ADD' },
      ])
      return s
    }

    if (attacker.status === 'paralysed' && Math.random() < 0.25) {
      s = await addLog(s, roundTurn, [
        { type: 'info', text: `${attName} is paralysed! It can't move!`, color: '#EF9F27' },
      ])
      return s
    }

    const originalMoveName = move.name
    let moveUsed = move
    const ppNow = attacker.currentPp[originalMoveName] ?? 0
    if (ppNow <= 0 && originalMoveName !== 'Struggle') {
      moveUsed = STRUGGLE_MOVE
    } else if (originalMoveName !== 'Struggle' && ppNow > 0) {
      const arr = [...s[attackerSide === 'player' ? 'playerTeam' : 'aiTeam']]
      arr[aIdx] = {
        ...attacker,
        currentPp: { ...attacker.currentPp, [originalMoveName]: ppNow - 1 },
      }
      if (attackerSide === 'player') s.playerTeam = arr
      else s.aiTeam = arr
      attacker = arr[aIdx]!
    }

    s = await addLog(s, roundTurn, [
      { type: 'move', text: `${attName} used ${moveUsed.name}!` },
      { type: 'info', text: formatMoveSummary(moveUsed), color: '#9ca3c4' },
    ])

    if (missesAccuracy(moveUsed)) {
      s = await addLog(s, roundTurn, [{ type: 'info', text: `${attName}'s attack missed!` }])
      return s
    }

    const battleDiff = (s.trainer?.difficulty ?? 5) as 1 | 2 | 3 | 4 | 5
    const { damage, mult, isCritical } = calcDamage(attacker, moveUsed, defender, battleDiff)
    s = applyEduForHit(s, attName, moveUsed, defName, defender, mult)

    const eff = effectivenessLabel(mult)
    if (eff) {
      s = await addLog(s, roundTurn, [
        { type: 'effectiveness', text: eff, color: effectivenessColor(mult) },
      ])
    }
    if (isCritical && moveUsed.category !== 'Status' && damage > 0) {
      s = await addLog(s, roundTurn, [{ type: 'info', text: "It's a critical hit!", color: '#f0b84a' }])
    }

    if (moveUsed.category === 'Status' || damage === 0) {
      const st = applyStatusFromMove(moveUsed, defender, battleDiff, roundTurn)
      if (st) {
        const dArr = [...s[defenderSide === 'player' ? 'playerTeam' : 'aiTeam']]
        const turns = st === 'asleep' || st === 'confused' ? 3 : 0
        dArr[dIdx] = { ...defender, status: st as BattlePokemon['status'], statusTurns: turns }
        if (defenderSide === 'player') s.playerTeam = dArr
        else s.aiTeam = dArr
        defender = dArr[dIdx]!
        const col =
          st === 'paralysed'
            ? '#EF9F27'
            : st === 'poisoned'
              ? '#7F77DD'
              : st === 'burned'
                ? '#D85A30'
                : st === 'asleep'
                  ? '#378ADD'
                  : '#D4537E'
        s = await addLog(s, roundTurn, [{ type: 'status', text: `${defName} was afflicted with ${st}!`, color: col }])
      }
      return s
    }

    const newHp = Math.max(0, defender.currentHp - damage)
    if (defenderSide === 'player') {
      s.playerHpFlash += 1
      s.playerShake += 1
    } else {
      s.aiHpFlash += 1
      s.aiShake += 1
    }

    const dArr2 = [...s[defenderSide === 'player' ? 'playerTeam' : 'aiTeam']]
    dArr2[dIdx] = { ...defender, currentHp: newHp }
    if (defenderSide === 'player') {
      s.playerTeam = dArr2
      const pid = defender.id
      s = recordDamageTaken(s, pid, damage)
    } else {
      s.aiTeam = dArr2
    }
    if (attackerSide === 'player') {
      s = recordDamageDealt(s, attacker.id, moveUsed.name, damage)
    }

    s = await addLog(s, roundTurn, [{ type: 'damage', text: `${defName} took ${damage} damage!` }])

    const st2 = applyStatusFromMove(moveUsed, dArr2[dIdx]!, battleDiff, roundTurn)
    if (st2 && newHp > 0) {
      const turns2 = st2 === 'asleep' || st2 === 'confused' ? 3 : 0
      dArr2[dIdx] = { ...dArr2[dIdx]!, status: st2 as BattlePokemon['status'], statusTurns: turns2 }
      if (defenderSide === 'player') s.playerTeam = dArr2
      else s.aiTeam = dArr2
      const col2 =
        st2 === 'paralysed'
          ? '#EF9F27'
          : st2 === 'poisoned'
            ? '#7F77DD'
            : st2 === 'burned'
              ? '#D85A30'
              : st2 === 'asleep'
                ? '#378ADD'
                : '#D4537E'
      s = await addLog(s, roundTurn, [{ type: 'status', text: `${defName} was afflicted with ${st2}!`, color: col2 }])
    }

    await sleep(800)
    return s
  }

  const endOfTurnStatuses = async (s0: FullState, roundTurn: number): Promise<FullState> => {
    let s = cloneState(s0)
    const sides: Array<'player' | 'ai'> = ['player', 'ai']
    for (const side of sides) {
      const idx = side === 'player' ? s.playerActiveIndex : s.aiActiveIndex
      let mon = s[side === 'player' ? 'playerTeam' : 'aiTeam'][idx]!
      if (mon.currentHp <= 0) continue

      if (mon.status === 'poisoned') {
        const dmg = statusDamagePoison(mon)
        const nh = Math.max(0, mon.currentHp - dmg)
        const arr = [...s[side === 'player' ? 'playerTeam' : 'aiTeam']]
        arr[idx] = { ...mon, currentHp: nh }
        if (side === 'player') {
          s.playerTeam = arr
          s.playerHpFlash += 1
          s = recordDamageTaken(s, mon.id, dmg)
        } else {
          s.aiTeam = arr
          s.aiHpFlash += 1
        }
        mon = arr[idx]!
        s = await addLog(s, roundTurn, [
          { type: 'damage', text: `${mon.name} is hurt by poison!`, color: '#7F77DD' },
        ])
      }
      if (mon.status === 'burned') {
        const dmg = statusDamageBurn(mon)
        const nh = Math.max(0, mon.currentHp - dmg)
        const arr = [...s[side === 'player' ? 'playerTeam' : 'aiTeam']]
        arr[idx] = { ...mon, currentHp: nh }
        if (side === 'player') {
          s.playerTeam = arr
          s.playerHpFlash += 1
          s = recordDamageTaken(s, mon.id, dmg)
        } else {
          s.aiTeam = arr
          s.aiHpFlash += 1
        }
        mon = arr[idx]!
        s = await addLog(s, roundTurn, [
          { type: 'damage', text: `${mon.name} is hurt by its burn!`, color: '#D85A30' },
        ])
      }
      if (mon.status === 'confused' && mon.currentHp > 0 && Math.random() < 0.33) {
        const selfDmg = calcConfusionSelfDamage(mon)
        const nh = Math.max(0, mon.currentHp - selfDmg)
        const arr = [...s[side === 'player' ? 'playerTeam' : 'aiTeam']]
        arr[idx] = { ...mon, currentHp: nh }
        if (side === 'player') {
          s.playerTeam = arr
          s.playerShake += 1
          s.playerHpFlash += 1
          s = recordDamageTaken(s, mon.id, selfDmg)
        } else {
          s.aiTeam = arr
          s.aiShake += 1
          s.aiHpFlash += 1
        }
        s = await addLog(s, roundTurn, [
          { type: 'damage', text: `${mon.name} hurt itself in its confusion!`, color: '#D4537E' },
        ])
      }
      if (mon.status === 'asleep' && mon.currentHp > 0) {
        const arr = [...s[side === 'player' ? 'playerTeam' : 'aiTeam']]
        const m = arr[idx]!
        const nt = Math.max(0, m.statusTurns - 1)
        arr[idx] = { ...m, statusTurns: nt, status: nt === 0 ? 'none' : 'asleep' }
        if (side === 'player') s.playerTeam = arr
        else s.aiTeam = arr
        if (nt === 0) {
          s = await addLog(s, roundTurn, [{ type: 'info', text: `${m.name} woke up!`, color: '#378ADD' }])
        }
      }
    }
    return s
  }

  const faintCheckAndHandle = async (
    s0: FullState,
    roundTurn: number,
  ): Promise<FullState | 'pending-player'> => {
    let s = cloneState(s0)
    const pMon = s.playerTeam[s.playerActiveIndex]!
    const aMon = s.aiTeam[s.aiActiveIndex]!

    if (pMon.currentHp <= 0) {
      s = { ...s, playerFaintVisual: true }
      dispatch({ type: 'SET', payload: s })
      await sleep(600)
      s = { ...s, playerFaintVisual: false }
      const pid = pMon.id
      if (s.perf[pid]) {
        s = {
          ...s,
          perf: { ...s.perf, [pid]: { ...s.perf[pid]!, faintedTurn: roundTurn, finalHp: 0 } },
        }
      }
      s = await addLog(s, roundTurn, [{ type: 'faint', text: `${pMon.name} has fainted!` }])
      const alive = s.playerTeam.some((m, i) => i !== s.playerActiveIndex && m.currentHp > 0)
      if (!alive) {
        s = {
          ...s,
          phase: 'battle-over',
          outcome: 'loss',
          waiting: false,
          aiThinking: false,
        }
        dispatch({ type: 'SET', payload: s })
        return s
      }
      s = {
        ...s,
        phase: 'player-switch',
        switchForced: true,
        switchOpen: true,
        waiting: true,
      }
      dispatch({ type: 'SET', payload: s })
      return 'pending-player'
    }

    if (aMon.currentHp <= 0) {
      s = { ...s, aiFaintVisual: true }
      dispatch({ type: 'SET', payload: s })
      await sleep(600)
      s = { ...s, aiFaintVisual: false }
      s = await addLog(s, roundTurn, [{ type: 'faint', text: `${aMon.name} has fainted!` }])
      const bench = s.aiTeam
        .map((m, i) => ({ m, i }))
        .filter(({ m, i }) => i !== s.aiActiveIndex && m.currentHp > 0)
      if (bench.length === 0) {
        if (s.trainer) writeDefeatedAdd(s.trainer.id)
        s = {
          ...s,
          phase: 'battle-over',
          outcome: 'win',
          waiting: false,
          aiThinking: false,
          defeatedIds: readDefeated(),
        }
        dispatch({ type: 'SET', payload: s })
        return s
      }
      bench.sort((x, y) => y.m.currentHp - x.m.currentHp)
      const nextI = bench[0]!.i
      await sleep(1000)
      s = { ...s, aiActiveIndex: nextI }
      const sent = s.aiTeam[nextI]!
      s = await addLog(s, roundTurn, [
        { type: 'switch', text: `${s.trainer?.name ?? 'Trainer'} sends out ${sent.name}!` },
      ])
      dispatch({ type: 'SET', payload: s })
      return s
    }

    return s
  }

  const runRoundWithMoves = async (playerMove: BattleMove) => {
    if (processing.current) return
    processing.current = true
    let s = cloneState(stateRef.current)
    const roundTurn = s.turn
    s = { ...s, waiting: true }
    dispatch({ type: 'SET', payload: s })

    const pMon = s.playerTeam[s.playerActiveIndex]!
    const aMon = s.aiTeam[s.aiActiveIndex]!

    let playerFirst = pMon.spd > aMon.spd
    if (pMon.spd === aMon.spd) playerFirst = Math.random() < 0.5

    const aiPick = selectAiMove(aMon, pMon)
    const order: Array<{ who: 'player' | 'ai'; move: BattleMove }> = playerFirst
      ? [
          { who: 'player', move: playerMove },
          { who: 'ai', move: aiPick },
        ]
      : [
          { who: 'ai', move: aiPick },
          { who: 'player', move: playerMove },
        ]

    for (let step = 0; step < order.length; step++) {
      const { who, move } = order[step]!

      const p = s.playerTeam[s.playerActiveIndex]!
      const a = s.aiTeam[s.aiActiveIndex]!
      if (p.currentHp <= 0 || a.currentHp <= 0) break

      if (who === 'ai') {
        s = { ...s, aiThinking: true }
        dispatch({ type: 'SET', payload: s })
        s = await addLog(s, roundTurn, [
          { type: 'info', text: `${s.trainer?.name ?? 'Trainer'} is thinking...`, color: '#8a8fa8' },
        ])
        await sleep(1200)
        s = { ...s, aiThinking: false }
        dispatch({ type: 'SET', payload: s })
      }

      const attackerSide = who
      const defenderSide = who === 'player' ? 'ai' : 'player'
      s = await executeAttack(s, roundTurn, attackerSide, defenderSide, move)

      const chk = await faintCheckAndHandle(s, roundTurn)
      if (chk === 'pending-player') {
        processing.current = false
        return
      }
      if (chk.phase === 'battle-over') {
        processing.current = false
        return
      }
      s = chk

      if (s.playerTeam[s.playerActiveIndex]!.currentHp <= 0 || s.aiTeam[s.aiActiveIndex]!.currentHp <= 0) {
        break
      }
      await sleep(800)
    }

    s = await endOfTurnStatuses(s, roundTurn)
    const chk2 = await faintCheckAndHandle(s, roundTurn)
    if (chk2 === 'pending-player') {
      processing.current = false
      return
    }
    if (chk2.phase === 'battle-over') {
      processing.current = false
      return
    }
    s = chk2

    s.turn += 1
    s.waiting = false
    s.aiThinking = false
    dispatch({ type: 'SET', payload: s })
    processing.current = false
  }

  const onMove = (m: BattleMove) => {
    if (state.waiting || state.phase !== 'battle') return
    void runRoundWithMoves(m)
  }

  const onSkipTurn = () => {
    if (state.waiting || state.phase !== 'battle') return
    const p = stateRef.current.playerTeam[stateRef.current.playerActiveIndex]
    const m = p?.moves[0]
    if (m) void runRoundWithMoves(m)
  }

  const runSwitchOnlyRound = async (newIndex: number) => {
    if (processing.current) return
    processing.current = true
    let s = cloneState(stateRef.current)
    const roundTurn = s.turn
    s = {
      ...s,
      playerActiveIndex: newIndex,
      switchOpen: false,
      switchForced: false,
      waiting: true,
    }
    const neu = s.playerTeam[newIndex]!
    s = await addLog(s, roundTurn, [{ type: 'switch', text: `Go! ${neu.name}!` }])

    const aMon = s.aiTeam[s.aiActiveIndex]!
    s = { ...s, aiThinking: true }
    dispatch({ type: 'SET', payload: s })
    s = await addLog(s, roundTurn, [
      { type: 'info', text: `${s.trainer?.name ?? 'Trainer'} is thinking...`, color: '#8a8fa8' },
    ])
    await sleep(1200)
    s = { ...s, aiThinking: false }
    dispatch({ type: 'SET', payload: s })

    const playerDefender = s.playerTeam[s.playerActiveIndex]!
    const aiMove = selectAiMove(aMon, playerDefender)
    s = await executeAttack(s, roundTurn, 'ai', 'player', aiMove)
    const chk = await faintCheckAndHandle(s, roundTurn)
    if (chk === 'pending-player') {
      processing.current = false
      return
    }
    if (chk.phase === 'battle-over') {
      processing.current = false
      return
    }
    s = chk

    s = await endOfTurnStatuses(s, roundTurn)
    const chk2 = await faintCheckAndHandle(s, roundTurn)
    if (chk2 === 'pending-player') {
      processing.current = false
      return
    }
    if (chk2.phase === 'battle-over') {
      processing.current = false
      return
    }
    s = chk2

    s.turn += 1
    s.waiting = false
    dispatch({ type: 'SET', payload: s })
    processing.current = false
  }

  const completeForcedSwitch = (index: number) => {
    setS((p) => {
      const neu = p.playerTeam[index]!
      const logSeq = p.logSeq + 1
      return {
        ...p,
        playerActiveIndex: index,
        phase: 'battle',
        switchOpen: false,
        switchForced: false,
        waiting: false,
        aiThinking: false,
        logSeq,
        log: [
          ...p.log,
          {
            id: logSeq,
            type: 'switch' as const,
            text: `[Turn ${p.turn}] Go! ${neu.name}!`,
          },
        ],
      }
    })
    processing.current = false
  }

  const onSwitchPick = (index: number) => {
    if (state.switchForced) {
      completeForcedSwitch(index)
      return
    }
    if (state.phase === 'battle' && state.switchOpen) {
      void runSwitchOnlyRound(index)
    }
  }

  const onOpenSwitch = () => {
    if (state.waiting || state.phase !== 'battle') return
    setS((p) => ({ ...p, switchOpen: true, switchForced: false }))
  }

  const onCloseSwitch = () => {
    if (state.switchForced) return
    setS((p) => ({ ...p, switchOpen: false }))
  }

  const startBattle = (trainer: Trainer) => {
    const diffMult = getDifficultyStatMultiplier(trainer.difficulty)
    const d = trainer.difficulty
    const aiTeam = trainer.teamIds
      .map((id) => CHARACTERS.find((c) => c.id === id))
      .filter((c): c is Character => c != null)
      .map((c) => characterToBattlePokemon(c, diffMult, false, d))
    const playerTeam = stateRef.current.playerSource.map((c) =>
      characterToBattlePokemon(c, 1.0, true, d),
    )
    setS((p) => ({
      ...p,
      phase: 'battle',
      trainer,
      playerTeam,
      aiTeam,
      playerActiveIndex: 0,
      aiActiveIndex: 0,
      turn: 1,
      log: [],
      logSeq: 0,
      waiting: false,
      aiThinking: false,
      switchOpen: false,
      switchForced: false,
      outcome: null,
      perf: initPerf(p.playerSource),
      edu: [],
      playerShake: 0,
      aiShake: 0,
      playerFaintVisual: false,
      aiFaintVisual: false,
      playerHpFlash: 0,
      aiHpFlash: 0,
    }))
  }

  const onChallenge = (trainer: Trainer) => {
    setS((p) => ({ ...p, flashColor: trainer.color }))
    window.setTimeout(() => {
      setS((p) => ({ ...p, flashColor: null }))
      startBattle(trainer)
    }, 300)
  }

  const onBattleAgain = () => {
    const tr = state.trainer
    if (!tr) return
    startBattle(tr)
  }

  const onChooseTrainer = () => {
    setS((p) => ({
      ...p,
      phase: 'trainer-select',
      trainer: null,
      flashColor: null,
      defeatedIds: readDefeated(),
    }))
  }

  const onHome = () => {
    navigate('/')
  }

  if (playerSource.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0e1a] px-4 text-[#f0ede6]">
        <p className="font-[family-name:var(--font-inter)] text-lg">No team selected</p>
        <Link
          to="/"
          className="font-[family-name:var(--font-cinzel)] text-[#c9922a] underline decoration-[rgba(201,146,42,0.4)] underline-offset-4 hover:text-[#e0b050]"
        >
          Back to Team Builder
        </Link>
      </div>
    )
  }

  if (state.phase === 'trainer-select') {
    return (
      <TrainerSelect
        playerTeam={playerSource}
        defeatedIds={state.defeatedIds}
        onChallenge={onChallenge}
        flashColor={state.flashColor}
      />
    )
  }

  if (state.phase === 'battle-over' && state.trainer && state.outcome) {
    const perfRows = buildPerfRows(
      state.playerSource,
      new Map(Object.entries(state.perf).map(([k, v]) => [Number(k), v])),
      state.playerTeam,
    )
    const nextTrainerId = state.outcome === 'win' && state.trainer.id < 5 ? state.trainer.id + 1 : null
    return (
      <BattleOver
        won={state.outcome === 'win'}
        trainer={state.trainer}
        perfRows={perfRows}
        eduCards={state.edu}
        nextTrainerId={nextTrainerId}
        onBattleAgain={onBattleAgain}
        onChooseTrainer={onChooseTrainer}
        onHome={onHome}
        onNextTrainer={() => {
          const t = TRAINERS.find((x) => x.id === nextTrainerId)
          if (t) onChallenge(t)
        }}
      />
    )
  }

  if (state.phase === 'battle' || state.phase === 'player-switch') {
    const { player, ai } = getActive(state)
    return (
      <BattleArena
        trainer={state.trainer!}
        playerActive={player}
        aiActive={ai}
        playerTeam={state.playerTeam}
        playerActiveIndex={state.playerActiveIndex}
        turn={state.turn}
        log={state.log}
        waiting={state.waiting}
        aiThinking={state.aiThinking}
        switchOpen={state.switchOpen}
        switchForced={state.switchForced}
        playerShake={state.playerShake}
        aiShake={state.aiShake}
        playerFaintedVisual={state.playerFaintVisual}
        aiFaintedVisual={state.aiFaintVisual}
        playerHpFlash={state.playerHpFlash}
        aiHpFlash={state.aiHpFlash}
        onMove={onMove}
        onSkipTurn={onSkipTurn}
        onOpenSwitch={onOpenSwitch}
        onCloseSwitch={onCloseSwitch}
        onSwitchPick={onSwitchPick}
      />
    )
  }

  return null
}
