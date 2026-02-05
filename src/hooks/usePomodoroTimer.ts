'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PomodoroMode } from '@/types'

interface UsePomodoroTimerProps {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  onSessionComplete?: (mode: PomodoroMode, duration: number) => void
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
  const startTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

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
      const actualDuration = elapsed
      onSessionComplete?.(mode, actualDuration)
      setCompletedSessions(prev => prev + 1)
    } else {
      animationFrameRef.current = requestAnimationFrame(updateTimeLeft)
    }
  }, [mode, isRunning, getDurationForMode, onSessionComplete])

  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateTimeLeft)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, updateTimeLeft])

  const resetTimer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    startTimeRef.current = null
    setTimeLeft(getDurationForMode(mode))
    setIsRunning(false)
  }, [mode, getDurationForMode])

  const switchMode = useCallback((newMode: PomodoroMode) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
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
