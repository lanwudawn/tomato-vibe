'use client'

import { clsx } from 'clsx'
import { PomodoroMode } from '@/types'

interface ModeSelectorProps {
  currentMode: PomodoroMode
  onModeChange: (mode: PomodoroMode) => void
  sessionsCompleted: number
  sessionsBeforeLongBreak: number
  isRunning?: boolean
}

export function ModeSelector({
  currentMode,
  onModeChange,
  sessionsCompleted,
  sessionsBeforeLongBreak,
  isRunning,
}: ModeSelectorProps) {
  const modes: { id: PomodoroMode; label: string }[] = [
    { id: 'focus', label: '专注' },
    { id: 'shortBreak', label: '短休息' },
    { id: 'longBreak', label: '长休息' },
  ]

  const completedDots = Array.from({ length: sessionsBeforeLongBreak }).map((_, i) => (
    <div
      key={i}
      className={clsx(
        'w-3 h-3 rounded-full transition-colors',
        i < sessionsCompleted % sessionsBeforeLongBreak
          ? 'bg-red-500'
          : 'bg-gray-300 dark:bg-gray-600'
      )}
    />
  ))

  const handleModeChange = (mode: PomodoroMode) => {
    if (mode === currentMode) return

    if (isRunning) {
      if (!confirm('计时器正在运行，切换模式将丢失当前进度。确定要切换吗？')) {
        return
      }
    }
    onModeChange(mode)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            className={clsx(
              'px-6 py-2 rounded-full font-medium transition-all',
              currentMode === mode.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2">
        {completedDots}
      </div>
    </div>
  )
}
