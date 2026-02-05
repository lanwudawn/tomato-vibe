'use client'

import { Play, Pause, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'
import { formatTime } from '@/hooks/usePomodoroTimer'

interface TimerDisplayProps {
  timeLeft: number
  isRunning: boolean
  mode: 'focus' | 'shortBreak' | 'longBreak'
  progress: number
  onToggle: () => void
  onReset: () => void
}

export function TimerDisplay({
  timeLeft,
  isRunning,
  mode,
  progress,
  onToggle,
  onReset,
}: TimerDisplayProps) {
  const modeColors = {
    focus: 'text-red-500',
    shortBreak: 'text-green-500',
    longBreak: 'text-blue-500',
  }

  const modeLabels = {
    focus: '专注时间',
    shortBreak: '短休息',
    longBreak: '长休息',
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className={clsx('text-2xl font-medium mb-2', modeColors[mode])}>
          {modeLabels[mode]}
        </h2>
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="130"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="144"
              cy="144"
              r="130"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${progress * 8.14} 814`}
              className={clsx('transition-all duration-1000 ease-linear', modeColors[mode])}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-7xl font-bold text-gray-800 dark:text-white">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onToggle}
          className={clsx(
            'flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all',
            'hover:scale-105 active:scale-95',
            isRunning
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          )}
        >
          {isRunning ? (
            <>
              <Pause size={20} />
              暂停
            </>
          ) : (
            <>
              <Play size={20} />
              开始
            </>
          )}
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium
                     bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                     hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          <RotateCcw size={20} />
          重置
        </button>
      </div>
    </div>
  )
}
