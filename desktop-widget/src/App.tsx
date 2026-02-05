import { useState, useEffect } from 'react'
import { TimerWidget } from './components/TimerWidget'
import { SupabaseProvider } from './lib/supabase'
import './App.css'

export default function App() {
  const [timerState, setTimerState] = useState<{
    mode: 'focus' | 'shortBreak' | 'longBreak'
    timeLeft: number
    isRunning: boolean
    activeTaskTitle: string | null
    connected: boolean
  }>({
    mode: 'focus',
    timeLeft: 25 * 60,
    isRunning: false,
    activeTaskTitle: null,
    connected: false,
  })

  useEffect(() => {
    const unsubscribe = SupabaseProvider.subscribe(
      (state) => {
        setTimerState((prev) => ({
          ...prev,
          ...state,
          connected: true,
        }))
      },
      () => {
        setTimerState((prev) => ({
          ...prev,
          connected: false,
        }))
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="app">
      <TimerWidget
        mode={timerState.mode}
        timeLeft={timerState.timeLeft}
        isRunning={timerState.isRunning}
        activeTaskTitle={timerState.activeTaskTitle}
        connected={timerState.connected}
        onClose={() => {
          window.close()
        }}
        onToggle={() => {
          window.api?.openWebApp()
        }}
      />
    </div>
  )
}
