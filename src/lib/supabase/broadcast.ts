import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

let userId = ''

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getUserId(): string {
  if (userId) return userId
  const stored = localStorage.getItem('pomodoro_user_id')
  if (stored) {
    userId = stored
    return userId
  }
  userId = crypto.randomUUID ? crypto.randomUUID() : generateUUID()
  localStorage.setItem('pomodoro_user_id', userId)
  return userId
}

const CHANNEL_NAME = 'pomodoro-timer'

export function getStoredUserId(): string {
  return getUserId()
}

interface TimerState {
  mode: 'focus' | 'shortBreak' | 'longBreak'
  timeLeft: number
  isRunning: boolean
  activeTaskTitle: string | null
  completedSessions: number
}

interface TimerBroadcast {
  type: 'timer_update' | 'session_complete'
  userId: string
  data: TimerState & {
    taskId?: string
    duration?: number
  }
}

let channel: ReturnType<typeof supabase.channel> | null = null

function getOrCreateChannel() {
  if (channel) return channel
  channel = supabase.channel(CHANNEL_NAME)
  return channel
}

export async function broadcastTimerState(
  mode: TimerState['mode'],
  timeLeft: number,
  isRunning: boolean,
  activeTask: { id: string; title: string } | null,
  completedSessions: number
): Promise<void> {
  const ch = getOrCreateChannel()
  const payload: TimerBroadcast = {
    type: 'timer_update',
    userId: getUserId(),
    data: {
      mode,
      timeLeft,
      isRunning,
      activeTaskTitle: activeTask?.title || null,
      completedSessions,
    },
  }
  await ch.send({
    type: 'broadcast',
    event: 'timer_update',
    payload,
  })
}

export async function broadcastSessionComplete(
  mode: TimerState['mode'],
  duration: number,
  taskId?: string
): Promise<void> {
  const ch = getOrCreateChannel()
  const payload: TimerBroadcast = {
    type: 'session_complete',
    userId: getUserId(),
    data: {
      mode,
      timeLeft: 0,
      isRunning: false,
      activeTaskTitle: null,
      completedSessions: 0,
      taskId,
      duration,
    },
  }
  await ch.send({
    type: 'broadcast',
    event: 'session_complete',
    payload,
  })
}
