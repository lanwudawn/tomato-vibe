import { createClient } from './client'
import { PomodoroMode } from '@/types'

interface SessionData {
  mode: PomodoroMode
  duration: number
  task_id?: string
}

export async function saveSession(session: SessionData): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      user_id: user.id,
      mode: session.mode,
      duration: session.duration,
      task_id: session.task_id || null,
      completed: true,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error saving session:', error)
    return false
  }

  return true
}

export async function getTodaySessions(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('duration')
    .eq('user_id', user.id)
    .eq('completed', true)
    .eq('mode', 'focus')
    .gte('started_at', today.toISOString())

  if (error) {
    console.error('Error fetching today sessions:', error)
    return 0
  }

  return (data || []).reduce((acc, session) => acc + session.duration / 60, 0)
}
