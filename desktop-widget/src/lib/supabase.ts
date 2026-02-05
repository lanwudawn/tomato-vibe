import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

const SUPABASE_URL = (import.meta as unknown as { env: { VITE_SUPABASE_URL: string } }).env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = (import.meta as unknown as { env: { VITE_SUPABASE_ANON_KEY: string } }).env.VITE_SUPABASE_ANON_KEY || ''

interface TimerState {
  mode: 'focus' | 'shortBreak' | 'longBreak'
  timeLeft: number
  isRunning: boolean
  activeTaskTitle: string | null
}

interface TimerBroadcast {
  type: 'timer_update' | 'session_complete'
  userId: string
  data: TimerState & {
    completedSessions?: number
    taskId?: string
    duration?: number
  }
}

class SupabaseProviderClass {
  private client: SupabaseClient
  private channel: RealtimeChannel | null = null
  private userId: string = ''
  private callbacks: Set<(state: TimerState) => void> = new Set()
  private disconnectCallbacks: Set<() => void> = new Set()

  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    this.userId = this.getStoredUserId()
  }

  private getStoredUserId(): string {
    let userId = localStorage.getItem('pomodoro_user_id')
    if (!userId) {
      userId = crypto.randomUUID()
      localStorage.setItem('pomodoro_user_id', userId)
    }
    return userId
  }

  subscribe(
    onUpdate: (state: TimerState) => void,
    onDisconnect?: () => void
  ): () => void {
    this.callbacks.add(onUpdate)
    if (onDisconnect) {
      this.disconnectCallbacks.add(onDisconnect)
    }

    if (!this.channel) {
      this.channel = this.client.channel('pomodoro-timer')

      this.channel
        .on('broadcast', { event: 'timer_update' }, ({ payload }: { payload: TimerBroadcast }) => {
          if (payload.userId !== this.userId) {
            const state: TimerState = {
              mode: payload.data.mode,
              timeLeft: payload.data.timeLeft,
              isRunning: payload.data.isRunning,
              activeTaskTitle: payload.data.activeTaskTitle || null,
            }
            this.callbacks.forEach((cb) => cb(state))
          }
        })
        .on('broadcast', { event: 'session_complete' }, ({ payload }: { payload: TimerBroadcast }) => {
          if (payload.userId !== this.userId && payload.userId !== 'demo-user') {
            console.log('Session completed:', payload.data)
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to Pomodoro timer updates')
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.disconnectCallbacks.forEach((cb) => cb())
          }
        })
    }

    return () => {
      this.callbacks.delete(onUpdate)
      if (onDisconnect) {
        this.disconnectCallbacks.delete(onDisconnect)
      }
    }
  }

  unsubscribe(): void {
    if (this.channel) {
      this.client.removeChannel(this.channel)
      this.channel = null
    }
    this.callbacks.clear()
    this.disconnectCallbacks.clear()
  }

  getChannel(): RealtimeChannel | null {
    return this.channel
  }
}

export const SupabaseProvider = new SupabaseProviderClass()
