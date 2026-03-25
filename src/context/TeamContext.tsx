/* eslint-disable react-refresh/only-export-components -- context hook exported with provider */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { BUDGET, CHARACTERS, type Character } from '../../data/characters'
import {
  toastAddCharacter,
  toastBudgetLow,
  toastCantAfford,
  toastCustomCreature,
  toastCustomNeedsName,
  toastCustomRemoved,
  toastCustomTeamUpdated,
  toastRandomise,
  toastRemoveCharacter,
  toastTeamFull,
} from '../lib/toast'

const STAT_KEYS = ['hp', 'atk', 'def', 'spatk', 'spdef', 'spd'] as const

export type CustomCreature = {
  name: string
  hp: number
  atk: number
  def: number
  spatk: number
  spdef: number
  spd: number
}

const defaultCustom = (): CustomCreature => ({
  name: '',
  hp: 10,
  atk: 10,
  def: 10,
  spatk: 10,
  spdef: 10,
  spd: 10,
})

function sumCustom(c: CustomCreature) {
  return c.hp + c.atk + c.def + c.spatk + c.spdef + c.spd
}

/** Minimum Drachma the blueprint custom always occupies (6 × 10). */
function minCustomDrachma() {
  return sumCustom(defaultCustom())
}

/** Reduce stats from spd→hp until custom fits `cap` (each stat floor 10). */
function trimCustomToCap(prev: CustomCreature, cap: number): CustomCreature {
  if (sumCustom(prev) <= cap) return prev
  const next = { ...prev }
  let guard = 0
  while (sumCustom(next) > cap && guard < 5000) {
    let reduced = false
    for (const k of [...STAT_KEYS].reverse()) {
      if (next[k] > 10) {
        next[k] -= 1
        reduced = true
        break
      }
    }
    if (!reduced) break
    guard++
  }
  return next
}

/** Factory settings (10 per stat = 60₯) — not shown on the budget meter until roster or custom is committed / edited. */
function isDefaultCustomStats(c: CustomCreature): boolean {
  return STAT_KEYS.every((k) => c[k] === 10)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type TeamContextValue = {
  roster: (Character | null)[]
  custom: CustomCreature
  customSaved: boolean
  budget: number
  rosterSpent: number
  customSpent: number
  totalSpent: number
  remaining: number
  rosterCount: number
  addCharacter: (c: Character) => void
  removeFromSlot: (index: number) => void
  setCustom: (patch: Partial<CustomCreature>) => void
  saveCustomToTeam: () => void
  removeCustomFromTeam: () => void
  randomiseTeam: () => void
  isOnTeam: (id: number) => boolean
  canAfford: (cost: number) => boolean
  /** Place or replace Mythmon at roster index 0–3 (picker / slot UX). Returns false if budget or duplicate blocked the change. */
  placeCharacterInSlot: (slotIndex: number, c: Character) => boolean
  /** Budget check if this slot were set to a Mythmon of `cost` (replaces current occupant). */
  canAffordInSlot: (slotIndex: number, cost: number) => boolean
}

const TeamContext = createContext<TeamContextValue | null>(null)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [roster, setRoster] = useState<(Character | null)[]>([null, null, null, null])
  const [custom, setCustomState] = useState<CustomCreature>(defaultCustom)
  const [customSaved, setCustomSaved] = useState(false)
  const customSavedRef = useRef(customSaved)
  const warnedLowRef = useRef(false)

  useEffect(() => {
    customSavedRef.current = customSaved
  }, [customSaved])

  const rosterSpent = useMemo(
    () => roster.reduce((s, c) => s + (c?.cost ?? 0), 0),
    [roster],
  )
  const customSpent = useMemo(() => sumCustom(custom), [custom])
  const rawTotalSpent = rosterSpent + customSpent
  const rosterCount = roster.filter(Boolean).length
  const hideDefaultCustomOnMeter =
    rosterSpent === 0 && !customSaved && isDefaultCustomStats(custom)
  const totalSpentBase = hideDefaultCustomOnMeter ? rosterSpent : rawTotalSpent
  const totalSpent = Math.min(totalSpentBase, BUDGET)
  const remaining = Math.max(0, BUDGET - totalSpentBase)
  const rawRemainingClamped = Math.max(0, BUDGET - rawTotalSpent)

  const customRef = useRef(custom)
  useEffect(() => {
    customRef.current = custom
  }, [custom])

  useEffect(() => {
    if (rawRemainingClamped < 50 && rawRemainingClamped > 0 && rosterCount > 0) {
      if (!warnedLowRef.current) {
        warnedLowRef.current = true
        toastBudgetLow(rawRemainingClamped)
      }
    } else if (rawRemainingClamped >= 50) {
      warnedLowRef.current = false
    }
  }, [rawRemainingClamped, rosterCount])

  /** When roster cost changes, trim custom so roster + custom ≤ budget. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      setCustomState((prev) => {
        const cap = Math.max(0, BUDGET - rosterSpent)
        return trimCustomToCap(prev, cap)
      })
    }, 0)
    return () => window.clearTimeout(id)
  }, [rosterSpent])

  /**
   * Last resort if combined spend still exceeds budget (e.g. legacy state): drop roster picks from slot 3→0
   * until roster + current custom fits. Custom is already at stat floors; cannot go below minCustomDrachma().
   */
  useEffect(() => {
    if (rawTotalSpent <= BUDGET) return
    const id = window.setTimeout(() => {
      const custSum = sumCustom(customRef.current)
      setRoster((prev) => {
        const next = [...prev]
        let s = next.reduce((acc, x) => acc + (x?.cost ?? 0), 0)
        for (let i = 3; i >= 0 && s + custSum > BUDGET; i--) {
          const ch = next[i]
          if (ch) {
            s -= ch.cost
            next[i] = null
          }
        }
        return next
      })
    }, 0)
    return () => window.clearTimeout(id)
  }, [rawTotalSpent])

  const canAfford = useCallback(
    (cost: number) => rosterSpent + cost + customSpent <= BUDGET,
    [rosterSpent, customSpent],
  )

  const canAffordInSlot = useCallback(
    (slotIndex: number, cost: number) => {
      const spent = roster.reduce(
        (s, x, i) => s + (i === slotIndex ? 0 : (x?.cost ?? 0)),
        0,
      )
      return spent + cost + customSpent <= BUDGET
    },
    [roster, customSpent],
  )

  const isOnTeam = useCallback(
    (id: number) => roster.some((c) => c?.id === id),
    [roster],
  )

  const addCharacter = useCallback((c: Character) => {
    const customTotal = sumCustom(custom)
    let toastKind: 'add' | 'full' | 'cant' | null = null
    setRoster((prev) => {
      if (prev.some((x) => x?.id === c.id)) return prev
      const idx = prev.findIndex((x) => x === null)
      if (idx === -1) {
        toastKind = 'full'
        return prev
      }
      const spent = prev.reduce((s, x) => s + (x?.cost ?? 0), 0)
      if (spent + c.cost + customTotal > BUDGET) {
        toastKind = 'cant'
        return prev
      }
      toastKind = 'add'
      const next = [...prev]
      next[idx] = c
      return next
    })
    if (toastKind === 'full') toastTeamFull()
    else if (toastKind === 'cant') toastCantAfford(c.name)
    else if (toastKind === 'add') toastAddCharacter(c.name)
  }, [custom])

  const placeCharacterInSlot = useCallback(
    (slotIndex: number, c: Character): boolean => {
      if (slotIndex < 0 || slotIndex > 3) return false
      const customTotal = sumCustom(custom)
      const outcome: { kind: 'add' | 'cant' | 'noop' } = { kind: 'noop' }
      setRoster((prev) => {
        if (prev[slotIndex]?.id === c.id) return prev
        if (prev.some((x, i) => x?.id === c.id && i !== slotIndex)) return prev
        const spent = prev.reduce(
          (s, x, i) => s + (i === slotIndex ? 0 : (x?.cost ?? 0)),
          0,
        )
        if (spent + c.cost + customTotal > BUDGET) {
          outcome.kind = 'cant'
          return prev
        }
        outcome.kind = 'add'
        const next = [...prev]
        next[slotIndex] = c
        return next
      })
      if (outcome.kind === 'cant') toastCantAfford(c.name)
      else if (outcome.kind === 'add') toastAddCharacter(c.name)
      return outcome.kind === 'add'
    },
    [custom],
  )

  const removeFromSlot = useCallback((index: number) => {
    let removedName: string | null = null
    setRoster((prev) => {
      const c = prev[index]
      if (!c) return prev
      removedName = c.name
      const next = [...prev]
      next[index] = null
      return next
    })
    if (removedName) toastRemoveCharacter(removedName)
  }, [])

  const setCustom = useCallback(
    (patch: Partial<CustomCreature>) => {
      setCustomState((prev) => {
        const next: CustomCreature = { ...prev, ...patch }
        if (typeof next.name === 'string') next.name = next.name.slice(0, 40)
        for (const k of STAT_KEYS) {
          if (typeof next[k] === 'number') {
            next[k] = Math.max(10, Math.min(255, Math.round(next[k])))
          }
        }
        const cap = Math.max(0, BUDGET - rosterSpent)
        if (customSavedRef.current && !next.name.trim()) {
          window.setTimeout(() => setCustomSaved(false), 0)
        }

        if (sumCustom(next) <= cap) return next

        const patchedStats = STAT_KEYS.filter((k) => k in patch && typeof patch[k] === 'number')
        if (patchedStats.length >= 1) {
          let guard = 0
          while (sumCustom(next) > cap && guard < 2000) {
            let reduced = false
            for (const k of [...patchedStats].reverse()) {
              if (next[k] > 10) {
                next[k] -= 1
                reduced = true
                break
              }
            }
            if (!reduced) break
            guard++
          }
          return next
        }

        return trimCustomToCap(next, cap)
      })
    },
    [rosterSpent],
  )

  const saveCustomToTeam = useCallback(() => {
    const name = custom.name.trim()
    if (!name) {
      toastCustomNeedsName()
      return
    }
    const cap = Math.max(0, BUDGET - rosterSpent)
    if (sumCustom(custom) > cap) {
      toastCantAfford('your creature')
      return
    }
    const alreadyOnTeam = customSaved
    setCustomSaved(true)
    if (!alreadyOnTeam) toastCustomCreature(name)
    else toastCustomTeamUpdated(name)
  }, [custom, rosterSpent, customSaved])

  const removeCustomFromTeam = useCallback(() => {
    const name = custom.name.trim() || 'Your creature'
    setCustomSaved(false)
    setCustomState(defaultCustom())
    toastCustomRemoved(name)
  }, [custom.name])

  const randomiseTeam = useCallback(() => {
    const shuffled = shuffle(CHARACTERS)
    const picked: Character[] = []
    let spent = 0
    /** Roster must leave room for default custom blueprint (6×10 = 60₯). */
    const rosterBudget = BUDGET - minCustomDrachma()
    for (const c of shuffled) {
      if (picked.length >= 4) break
      if (spent + c.cost <= rosterBudget) {
        picked.push(c)
        spent += c.cost
      }
    }
    if (picked.length < 4) {
      const byCost = [...CHARACTERS].sort((a, b) => a.cost - b.cost)
      picked.length = 0
      spent = 0
      for (const c of byCost) {
        if (picked.length >= 4) break
        if (spent + c.cost <= rosterBudget) {
          picked.push(c)
          spent += c.cost
        }
      }
    }
    setRoster([picked[0] ?? null, picked[1] ?? null, picked[2] ?? null, picked[3] ?? null])
    setCustomState(defaultCustom())
    setCustomSaved(false)
    toastRandomise()
  }, [])

  const value = useMemo(
    () => ({
      roster,
      custom,
      customSaved,
      budget: BUDGET,
      rosterSpent,
      customSpent,
      totalSpent,
      remaining,
      rosterCount,
      addCharacter,
      removeFromSlot,
      setCustom,
      saveCustomToTeam,
      removeCustomFromTeam,
      randomiseTeam,
      isOnTeam,
      canAfford,
      placeCharacterInSlot,
      canAffordInSlot,
    }),
    [
      roster,
      custom,
      customSaved,
      rosterSpent,
      customSpent,
      totalSpent,
      remaining,
      rosterCount,
      addCharacter,
      placeCharacterInSlot,
      removeFromSlot,
      setCustom,
      saveCustomToTeam,
      removeCustomFromTeam,
      randomiseTeam,
      isOnTeam,
      canAfford,
      canAffordInSlot,
    ],
  )

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}
