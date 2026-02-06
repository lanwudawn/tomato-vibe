import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsView } from '@/components/StatsView'

async function getStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const yearAgo = new Date(today)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  const [todaySessions, weekSessions, totalTasks, completedTasks, yearSessions] = await Promise.all([
    supabase
      .from('pomodoro_sessions')
      .select('duration')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('started_at', today.toISOString()),
    supabase
      .from('pomodoro_sessions')
      .select('duration')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('started_at', weekAgo.toISOString()),
    supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id),
    supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('completed', true),
    supabase
      .from('pomodoro_sessions')
      .select('started_at, duration')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('started_at', yearAgo.toISOString())
  ])

  const todayMinutes = (todaySessions.data || []).reduce(
    (acc, session) => acc + session.duration / 60,
    0
  )

  const weekMinutes = (weekSessions.data || []).reduce(
    (acc, session) => acc + session.duration / 60,
    0
  )

  // Process Heatmap Data
  const heatmapDataMap = new Map<string, number>()
    ; (yearSessions.data || []).forEach((session: any) => {
      const date = session.started_at.split('T')[0]
      const mins = session.duration / 60
      heatmapDataMap.set(date, (heatmapDataMap.get(date) || 0) + mins)
    })

  const heatmapData = Array.from(heatmapDataMap.entries()).map(([date, value]) => ({
    date,
    value
  }))

  // Calculate total all-time minutes for badges
  const totalMinutes = (yearSessions.data || []).reduce(
    (acc: number, session: any) => acc + session.duration / 60,
    0
  )

  return {
    todayMinutes: Math.round(todayMinutes),
    weekMinutes: Math.round(weekMinutes),
    totalTasks: totalTasks.count || 0,
    completedTasks: completedTasks.count || 0,
    heatmapData,
    totalMinutes: Math.round(totalMinutes)
  }
}

export default async function StatsPage() {
  const stats = await getStats()

  return <StatsView stats={stats} />
}
