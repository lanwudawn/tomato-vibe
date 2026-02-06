'use client'

import { useState, useEffect, useCallback } from 'react'
import { PomodoroSettings } from '@/types'

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  sedentaryReminderEnabled: false,
  sedentaryReminderInterval: 60,
  soundType: 'bell',
  soundVolume: 0.5,
  whiteNoiseType: 'none',
  whiteNoiseVolume: 0.5,
  hapticsEnabled: true,
}

function getInitialSettings(): PomodoroSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  const saved = localStorage.getItem('pomodoroSettings')
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    } catch {
      console.error('Failed to parse settings from localStorage')
    }
  }
  return DEFAULT_SETTINGS
}

export function usePomodoroSettings() {
  const [settings, setSettings] = useState<PomodoroSettings>(getInitialSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoaded(true)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    resetToDefaults,
    isLoaded,
  }
}
