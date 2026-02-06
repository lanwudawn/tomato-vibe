'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseSedentaryReminderProps {
    enabled: boolean
    interval: number // in minutes
}

export function useSedentaryReminder({ enabled, interval }: UseSedentaryReminderProps) {
    const lastReminderTimeRef = useRef<number>(Date.now())
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const sendNotification = useCallback(() => {
        if (typeof window === 'undefined') return

        // Play sound logic similar to usePomodoroTimer
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
            if (AudioContextClass) {
                const ctx = new AudioContextClass()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.frequency.value = 440 // A4 note
                osc.type = 'sine'
                gain.gain.setValueAtTime(0.3, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start()
                osc.stop(ctx.currentTime + 0.5)
            }
        } catch (e) {
            console.error('Failed to play reminder sound', e)
        }

        // Browser notification
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('久坐提醒', {
                    body: `你已经坐了 ${interval} 分钟了，起来活动一下吧！`,
                    icon: '/favicon.ico'
                })
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission()
            }
        }

        // Fallback alert if needed (optional, maybe too intrusive)
        // alert('该起身活动一下啦！')
    }, [interval])

    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            return
        }

        // Reset reminder time when enabled or interval changes
        lastReminderTimeRef.current = Date.now()

        timerRef.current = setInterval(() => {
            const now = Date.now()
            const elapsedMinutes = (now - lastReminderTimeRef.current) / 1000 / 60

            if (elapsedMinutes >= interval) {
                sendNotification()
                lastReminderTimeRef.current = now
            }
        }, 10000) // Check every 10 seconds

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [enabled, interval, sendNotification])

    const resetReminder = useCallback(() => {
        lastReminderTimeRef.current = Date.now()
    }, [])

    return { resetReminder }
}
