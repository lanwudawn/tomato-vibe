'use client'

import { Play, Pause, RotateCcw, Plus, Minus, BellOff } from 'lucide-react'
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
  isAlarmPlaying?: boolean
  onStopAlarm?: () => void
}

const modeColors = {
  focus: 'text-tomato',
  shortBreak: 'text-green-500',
  longBreak: 'text-blue-500',
}

const modeLabels = {
  focus: '专注中...',
  shortBreak: '稍作休息',
  longBreak: '深度放松',
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
  isAlarmPlaying,
  onStopAlarm,
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
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">
            Current Task
          </span>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-1">
            {activeTask.title}
          </p>
        </div>
      )}
      <div className="text-center relative">
        <h2 className={clsx('text-xl font-bold mb-4 tracking-tight transition-colors duration-500', modeColors[mode])}>
          {modeLabels[mode]}
        </h2>
        <div className={clsx(
          "relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mx-auto rounded-full transition-all duration-700",
          isRunning && mode === 'focus' ? 'animate-breathe' : 'shadow-xl dark:shadow-tomato/5'
        )}>
          <svg className="w-full h-full transform -rotate-90">
            <circle
              ref={circleRef}
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-100 dark:text-gray-800"
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
              className={clsx('transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]', modeColors[mode])}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-7xl sm:text-8xl font-bold text-gray-800 dark:text-white timer-text">
            {formatTime(timeLeft)}
          </span>
          {!isRunning && !isAlarmPlaying && (
            <div className="absolute bottom-16 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 animate-pulse">
              Press Space to Start
            </div>
          )}
        </div>

        {isAlarmPlaying && (
          <button
            onClick={onStopAlarm}
            className="absolute -bottom-4 animate-bounce bg-tomato text-white px-6 py-2 rounded-full font-bold shadow-xl shadow-tomato/40 flex items-center gap-2 hover:scale-110 transition-all z-20"
          >
            <BellOff size={18} />
            停止闹铃
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-6">
          <button
            onClick={onToggle}
            className={clsx(
              'flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg',
              'hover:scale-110 active:scale-95',
              isRunning
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-tomato text-white hover:bg-tomato-deep shadow-tomato/30'
            )}
          >
            {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="translate-x-0.5" fill="currentColor" />}
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center w-16 h-16 rounded-full 
                       bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                       hover:text-tomato dark:hover:text-tomato hover:bg-gray-50
                       shadow-md border border-gray-100 dark:border-gray-700 transition-all"
            title="Reset Timer"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {mode === 'focus' && onAdjustTime && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAdjustTime(-300)}
              disabled={timeLeft <= 60}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800
                         text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              <Minus size={14} />
              5m
            </button>
            <button
              onClick={() => handleAdjustTime(300)}
              disabled={timeLeft >= 60 * 60}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800
                         text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              <Plus size={14} />
              5m
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
