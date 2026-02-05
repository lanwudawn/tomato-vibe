'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PomodoroMode } from '@/types'

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const modeLabels: Record<PomodoroMode, string> = {
  focus: '专注中',
  shortBreak: '短休息',
  longBreak: '长休息',
}

function playCompletionSound(): void {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    console.error('Failed to play completion sound')
  }
}

interface UsePomodoroTimerProps {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  onSessionComplete?: (mode: PomodoroMode, duration: number, taskId?: string) => void
  taskId?: string | null
}

export function usePomodoroTimer({
  focusDuration,
  shortBreakDuration,
  longBreakDuration,
  onSessionComplete,
  taskId,
}: UsePomodoroTimerProps) {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getDurationForMode = useCallback((currentMode: PomodoroMode) => {
    switch (currentMode) {
      case 'focus':
        return focusDuration * 60
      case 'shortBreak':
        return shortBreakDuration * 60
      case 'longBreak':
        return longBreakDuration * 60
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration])

  const updateTimeLeft = useCallback(() => {
    if (!startTimeRef.current || !isRunning) return

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const totalDuration = getDurationForMode(mode)
    const remaining = Math.max(0, totalDuration - elapsed)
    setTimeLeft(remaining)

    if (remaining <= 0) {
      setIsRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      const actualDuration = elapsed
      playCompletionSound()
      onSessionComplete?.(mode, actualDuration, taskId || undefined)
      setCompletedSessions(prev => prev + 1)
    }
  }, [mode, isRunning, getDurationForMode, onSessionComplete, taskId])

  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      intervalRef.current = setInterval(updateTimeLeft, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, updateTimeLeft])

  useEffect(() => {
    if (isRunning) {
      document.title = `(${formatTime(timeLeft)}) ${modeLabels[mode]} - 番茄钟`
    } else {
      document.title = '番茄钟'
    }
    return () => {
      document.title = '番茄钟'
    }
  }, [timeLeft, isRunning, mode])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setTimeLeft(getDurationForMode(mode))
    setIsRunning(false)
  }, [mode, getDurationForMode])

  const switchMode = useCallback((newMode: PomodoroMode) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setMode(newMode)
    setTimeLeft(getDurationForMode(newMode))
    setIsRunning(false)
  }, [getDurationForMode])

  const start = useCallback(() => {
    if (timeLeft > 0) {
      startTimeRef.current = Date.now() - (getDurationForMode(mode) - timeLeft) * 1000
      setIsRunning(true)
    }
  }, [mode, timeLeft, getDurationForMode])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const toggle = useCallback(() => {
    if (isRunning) {
      pause()
    } else {
      start()
    }
  }, [isRunning, start, pause])

  const progress = useCallback(() => {
    const total = getDurationForMode(mode)
    return ((total - timeLeft) / total) * 100
  }, [mode, timeLeft, getDurationForMode])

  return {
    mode,
    timeLeft,
    isRunning,
    completedSessions,
    start,
    pause,
    toggle,
    resetTimer,
    switchMode,
    formatTime,
    progress,
    setTimeLeft,
  }
}
