import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import type { Character } from '../data/characters'
import { AppHeader } from './components/AppHeader'
import { BattleStatsPanel } from './components/BattleStatsPanel'
import { CharacterPickerModal } from './components/CharacterPickerModal'
import { MyTeamPanel } from './components/MyTeamPanel'
import { TabStrip, type MainTab } from './components/TabStrip'
import { TeamBuilderPanel } from './components/TeamBuilderPanel'
import { TeamSidebar } from './components/TeamSidebar'
import { TeamProvider, useTeam } from './context/TeamContext'
import BattlePage from './pages/BattlePage'

function Shell() {
  const [tab, setTab] = useState<MainTab>('builder')
  const [teamOpen, setTeamOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSession, setPickerSession] = useState(0)
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)
  const { roster, remaining, placeCharacterInSlot } = useTeam()
  const navigate = useNavigate()
  const playerTeamForBattle = roster.filter((x): x is Character => x != null)
  const canEnterBattle = playerTeamForBattle.length >= 1

  const openPicker = useCallback((idx: number) => {
    setActiveSlotIndex(idx)
    setPickerSession((k) => k + 1)
    setPickerOpen(true)
  }, [])

  const closePicker = useCallback(() => {
    setPickerOpen(false)
    setActiveSlotIndex(null)
  }, [])

  const onPickerSelect = useCallback(
    (c: Character) => {
      if (activeSlotIndex === null) return
      const ok = placeCharacterInSlot(activeSlotIndex, c)
      if (ok) closePicker()
    },
    [activeSlotIndex, placeCharacterInSlot, closePicker],
  )

  const closeTeam = useCallback(() => setTeamOpen(false), [])
  const openTeam = useCallback(() => setTeamOpen(true), [])

  useEffect(() => {
    if (teamOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [teamOpen])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0d0e1a] text-[#f0ede6]">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, #1a1035 0%, #0d0e1a 62%, #0d0e1a 100%)',
        }}
      />
      <div className="pointer-events-none fixed -left-32 top-24 -z-10 h-[320px] w-[320px] rounded-full bg-[#c9922a] opacity-[0.06] blur-[100px]" />
      <div className="pointer-events-none fixed right-[-80px] top-1/3 -z-10 h-[280px] w-[280px] rounded-full bg-[#6a40a8] opacity-[0.05] blur-[90px]" />
      <div className="pointer-events-none fixed bottom-20 left-1/4 -z-10 h-[360px] w-[360px] rounded-full bg-[#c9922a] opacity-[0.04] blur-[110px]" />
      <div className="pointer-events-none fixed bottom-[-60px] right-1/3 -z-10 h-[240px] w-[240px] rounded-full bg-[#4a2a7a] opacity-[0.07] blur-[80px]" />

      <AppHeader onOpenTeam={openTeam} />

      <div className="mx-auto flex max-w-[1800px] min-h-0 pt-[88px] min-[1200px]:gap-6 min-[1200px]:px-6 min-[1200px]:pb-10">
        <TeamSidebar
          className="hidden min-[1200px]:flex"
          onEnterBattle={() => navigate('/battle', { state: { playerTeam: playerTeamForBattle } })}
          canEnterBattle={canEnterBattle}
        />

        <main className="relative min-h-[calc(100vh-88px)] min-w-0 flex-1 px-4 pb-24 min-[1200px]:px-0 min-[1200px]:pb-10">
          <TabStrip active={tab} onChange={setTab} />
          <AnimatePresence mode="wait">
            {tab === 'builder' && <TeamBuilderPanel key="builder" onOpenPicker={openPicker} />}
            {tab === 'team' && <MyTeamPanel key="team" />}
            {tab === 'battle' && <BattleStatsPanel key="battle" />}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {teamOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close team panel"
              className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px] min-[1200px]:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTeam}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Your team"
              className="fixed z-[70] flex max-h-[92vh] min-h-0 w-full flex-col overflow-hidden border-[rgba(201,146,42,0.2)] bg-[#0d0e1a] shadow-[0_-8px_40px_rgba(0,0,0,0.45)] min-[768px]:max-[1199px]:bottom-0 min-[768px]:max-[1199px]:left-2 min-[768px]:max-[1199px]:right-2 min-[768px]:max-[1199px]:max-h-[55vh] min-[768px]:max-[1199px]:rounded-t-2xl min-[768px]:max-[1199px]:border min-[768px]:max-[1199px]:border-b-0 max-[767px]:inset-0 max-[767px]:border-0"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between border-b border-[rgba(201,146,42,0.12)] px-4 py-2 min-[1200px]:hidden">
                <span className="font-[family-name:var(--font-cinzel)] text-[15px] text-[#f0ede6]">Your Team</span>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] rounded-lg text-xl text-[#8a8fa8] hover:text-[#f0ede6]"
                  onClick={closeTeam}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <TeamSidebar
                  className="min-[1200px]:hidden !rounded-none !border-0 min-[768px]:max-[1199px]:max-h-[50vh]"
                  onEnterBattle={() => navigate('/battle', { state: { playerTeam: playerTeamForBattle } })}
                  canEnterBattle={canEnterBattle}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CharacterPickerModal
        key={pickerSession}
        isOpen={pickerOpen}
        onClose={closePicker}
        onSelect={onPickerSelect}
        remainingBudget={remaining}
        teamIds={roster.filter((x): x is Character => x != null).map((c) => c.id)}
        slotIndex={activeSlotIndex}
      />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <TeamProvider>
            <Shell />
          </TeamProvider>
        }
      />
      <Route path="/battle" element={<BattlePage />} />
    </Routes>
  )
}
