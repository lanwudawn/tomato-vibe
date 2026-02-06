'use client'

import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react'
import { clsx } from 'clsx'
import { formatTime } from '@/hooks/usePomodoroTimer'
import { useRef, useEffect, useState } from 'react'

interface TimerDisplayProps {
  timeLeft: number
  isRunning: boolean
  mode: 'focus' | 'shortBreak' | 'longBreak'
  progress: number
  onToggle: () => void
  onReset: () => void
  activeTask?: { id: string; title: string } | null
  onAdjustTime?: (delta: number) => void
}

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

export function TimerDisplay({
  timeLeft,
  isRunning,
  mode,
  progress,
  onToggle,
  onReset,
  activeTask,
  onAdjustTime,
}: TimerDisplayProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const [circumference, setCircumference] = useState(0)

  useEffect(() => {
    if (circleRef.current) {
      const r = circleRef.current.r.baseVal.value
      setCircumference(2 * Math.PI * r)
    }
  }, [])

  const handleAdjustTime = (delta: number) => {
    onAdjustTime?.(delta)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {activeTask && mode === 'focus' && (
        <div className="text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">正在进行</span>
          <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
            {activeTask.title}
          </p>
        </div>
      )}
      <div className="text-center">
        <h2 className={clsx('text-2xl font-medium mb-2', modeColors[mode])}>
          {modeLabels[mode]}
        </h2>
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              ref={circleRef}
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              className={clsx('transition-all duration-1000 ease-linear', modeColors[mode])}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-6xl sm:text-7xl font-bold text-gray-800 dark:text-white">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
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

        {mode === 'focus' && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>快捷键: Space 开始/暂停 | R 重置 | +/- 调整时长</span>
          </div>
        )}

        {mode === 'focus' && onAdjustTime && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdjustTime(-300)}
              disabled={timeLeft <= 60}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700
                         text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={16} />
              5分钟
            </button>
            <button
              onClick={() => handleAdjustTime(300)}
              disabled={timeLeft >= 60 * 60}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700
                         text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              5分钟
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
