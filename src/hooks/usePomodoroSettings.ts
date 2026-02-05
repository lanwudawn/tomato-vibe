'use client'

import { useState, useEffect } from 'react'
import { PomodoroSettings } from '@/types'

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
}

export function usePomodoroSettings() {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroSettings')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return DEFAULT_SETTINGS
        }
      }
    }
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return {
    settings,
    updateSettings,
    resetToDefaults,
  }
}
