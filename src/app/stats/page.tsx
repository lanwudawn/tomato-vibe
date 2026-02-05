import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Clock, Calendar, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

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

  const [todaySessions, weekSessions, totalTasks, completedTasks] = await Promise.all([
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
  ])

  const todayMinutes = (todaySessions.data || []).reduce(
    (acc, session) => acc + session.duration / 60,
    0
  )

  const weekMinutes = (weekSessions.data || []).reduce(
    (acc, session) => acc + session.duration / 60,
    0
  )

  return {
    todayMinutes: Math.round(todayMinutes),
    weekMinutes: Math.round(weekMinutes),
    totalTasks: totalTasks.count || 0,
    completedTasks: completedTasks.count || 0,
  }
}

export default async function StatsPage() {
  const stats = await getStats()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时 ${mins}分钟`
    }
    return `${mins}分钟`
  }

  const cards = [
    {
      title: '今日专注',
      value: formatTime(stats.todayMinutes),
      icon: Clock,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: '本周专注',
      value: formatTime(stats.weekMinutes),
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: '完成任务',
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: '完成率',
      value: stats.totalTasks > 0
        ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex items-center gap-4 mb-12">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            返回
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 统计
          </h1>
        </header>

        <main className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(card => (
            <div
              key={card.title}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <card.icon className={card.color} size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
