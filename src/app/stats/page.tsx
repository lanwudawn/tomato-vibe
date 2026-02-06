import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Clock, Calendar, Target, TrendingUp, Award, Zap } from 'lucide-react'
import Link from 'next/link'
import { Heatmap } from '@/components/Heatmap'

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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时 ${mins}分钟`
    }
    return `${mins}分钟`
  }

  // Achievement Logic
  const getBadge = (minutes: number) => {
    if (minutes >= 6000) return { name: '心流大师', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', desc: '累计专注超过100小时' }
    if (minutes >= 3000) return { name: '专注专家', icon: Award, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', desc: '累计专注超过50小时' }
    if (minutes >= 600) return { name: '进阶行者', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', desc: '累计专注超过10小时' }
    return { name: '初出茅庐', icon: Target, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', desc: '开始你的专注之旅' }
  }

  const badge = getBadge(stats.totalMinutes)

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
        <header className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            返回
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 统计中心
          </h1>
        </header>

        <main className="space-y-8">
          {/* Badge Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${badge.bg}`}>
                <badge.icon className={`w-8 h-8 ${badge.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{badge.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                    当前称号
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {badge.desc}
                </p>
                <div className="mt-2 w-full max-w-sm h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${badge.color.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(100, (stats.totalMinutes / 6000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </section>

          {/* Heatmap */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-red-500" />
              专注热力图 (过去一年)
            </h2>
            <Heatmap data={stats.heatmapData} />
          </section>
        </main>
      </div>
    </div>
  )
}
