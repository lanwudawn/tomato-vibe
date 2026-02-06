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

interface UsePomodoroTimerProps {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  onSessionComplete?: (mode: PomodoroMode, duration: number, taskId?: string) => void
  taskId?: string | null
  soundType?: 'bell' | 'digital' | 'wood'
  soundVolume?: number
  hapticsEnabled?: boolean
}

function sendNotification(mode: PomodoroMode) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  const titles = {
    focus: '专注时间结束',
    shortBreak: '短休息结束',
    longBreak: '长休息结束'
  }

  const bodies = {
    focus: '休息一下吧！喝口水，活动一下。',
    shortBreak: '准备好开始下一个专注时间了吗？',
    longBreak: '休息结束，精力充沛地开始工作吧！'
  }

  if (Notification.permission === 'granted') {
    new Notification(titles[mode], {
      body: bodies[mode],
      icon: '/favicon.ico',
      requireInteraction: true // Keep notification until user interacts
    })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission()
  }
}

function triggerHaptics() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([100, 50, 100])
  }
}

export function usePomodoroTimer({
  focusDuration,
  shortBreakDuration,
  longBreakDuration,
  onSessionComplete,
  taskId,
  soundType = 'bell',
  soundVolume = 0.5,
  hapticsEnabled = true,
}: UsePomodoroTimerProps) {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)

  const stopAlarm = useCallback(() => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause()
      alarmAudioRef.current.currentTime = 0
      alarmAudioRef.current = null
      setIsAlarmPlaying(false)
    }
  }, [])

  const playCompletionSound = useCallback((type: 'bell' | 'digital' | 'wood', volume: number) => {
    if (typeof window === 'undefined') return

    const sounds = {
      bell: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg',
      digital: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
      wood: 'https://actions.google.com/sounds/v1/foley/wood_hit.ogg',
    }

    try {
      stopAlarm()
      const audio = new Audio(sounds[type])
      audio.volume = volume
      audio.onended = () => setIsAlarmPlaying(false)
      alarmAudioRef.current = audio

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        setIsAlarmPlaying(true)
        playPromise.catch((error) => {
          console.error('Audio playback failed:', error)
          setIsAlarmPlaying(false)
        })
      }
    } catch (e) {
      console.error('Failed to initialize completion sound', e)
    }
  }, [stopAlarm])

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
      playCompletionSound(soundType, soundVolume)
      sendNotification(mode)
      if (hapticsEnabled) triggerHaptics()

      onSessionComplete?.(mode, actualDuration, taskId || undefined)
      setCompletedSessions(prev => prev + 1)
    }
  }, [mode, isRunning, getDurationForMode, onSessionComplete, taskId, soundType, soundVolume, hapticsEnabled, playCompletionSound])

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
      document.title = `(${formatTime(timeLeft)}) ${modeLabels[mode]} - 洋柿子氛围`
    } else {
      document.title = '洋柿子氛围'
    }
    return () => {
      document.title = '洋柿子氛围'
    }
  }, [timeLeft, isRunning, mode])

  const resetTimer = useCallback(() => {
    stopAlarm()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setTimeLeft(getDurationForMode(mode))
    setIsRunning(false)
  }, [mode, getDurationForMode, stopAlarm])

  const switchMode = useCallback((newMode: PomodoroMode) => {
    stopAlarm()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setMode(newMode)
    setTimeLeft(getDurationForMode(newMode))
    setIsRunning(false)
  }, [getDurationForMode, stopAlarm])

  const start = useCallback(() => {
    stopAlarm()
    if (timeLeft > 0) {
      startTimeRef.current = Date.now() - (getDurationForMode(mode) - timeLeft) * 1000
      setIsRunning(true)
    }
  }, [mode, timeLeft, getDurationForMode, stopAlarm])

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
    isAlarmPlaying,
    start,
    pause,
    toggle,
    resetTimer,
    switchMode,
    stopAlarm,
    formatTime,
    progress,
    setTimeLeft,
  }
}
