'use client'

import { useState, useEffect, useCallback } from 'react'
import { PomodoroMode } from '@/types'

interface UsePomodoroTimerProps {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  onSessionComplete?: (mode: PomodoroMode) => void
}

export function usePomodoroTimer({
  focusDuration,
  shortBreakDuration,
  longBreakDuration,
  onSessionComplete,
}: UsePomodoroTimerProps) {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)

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

  const resetTimer = useCallback(() => {
    setTimeLeft(getDurationForMode(mode))
    setIsRunning(false)
  }, [mode, getDurationForMode])

  const switchMode = useCallback((newMode: PomodoroMode) => {
    setMode(newMode)
    setTimeLeft(getDurationForMode(newMode))
    setIsRunning(false)
  }, [getDurationForMode])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const toggle = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      onSessionComplete?.(mode)
      setCompletedSessions(prev => {
        const newCount = prev + 1
        return newCount
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, mode, onSessionComplete])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

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
  }
}
