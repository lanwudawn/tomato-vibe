import { createClient } from './server'

export async function getFullStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const yearAgo = new Date(today)
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)

    const [
        todaySessions,
        yesterdaySessions,
        weekSessions,
        totalTasks,
        completedTasks,
        yearSessions
    ] = await Promise.all([
        // Today (Focus Only)
        supabase
            .from('pomodoro_sessions')
            .select('duration')
            .eq('user_id', user.id)
            .eq('completed', true)
            .eq('mode', 'focus')
            .gte('started_at', today.toISOString()),
        // Yesterday (Focus Only)
        supabase
            .from('pomodoro_sessions')
            .select('duration')
            .eq('user_id', user.id)
            .eq('completed', true)
            .eq('mode', 'focus')
            .gte('started_at', yesterday.toISOString())
            .lt('started_at', today.toISOString()),
        // Week (Focus Only)
        supabase
            .from('pomodoro_sessions')
            .select('duration')
            .eq('user_id', user.id)
            .eq('completed', true)
            .eq('mode', 'focus')
            .gte('started_at', weekAgo.toISOString()),
        // Tasks Stats
        supabase
            .from('tasks')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
        supabase
            .from('tasks')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('completed', true),
        // Year Data (Focus Only) - For Heatmap, Streak, & Badges
        supabase
            .from('pomodoro_sessions')
            .select('started_at, duration')
            .eq('user_id', user.id)
            .eq('completed', true)
            .eq('mode', 'focus')
            .gte('started_at', yearAgo.toISOString())
    ])

    // 1. Basic Stats Calculation
    const todayMinutes = (todaySessions.data || []).reduce((acc, s) => acc + s.duration / 60, 0)
    const yesterdayMinutes = (yesterdaySessions.data || []).reduce((acc, s) => acc + s.duration / 60, 0)
    const weekMinutes = (weekSessions.data || []).reduce((acc, s) => acc + s.duration / 60, 0)
    const totalMinutes = (yearSessions.data || []).reduce((acc, s: any) => acc + s.duration / 60, 0)

    // 2. Heatmap & Streak Data Processing
    const heatmapDataMap = new Map<string, number>()
    const uniqueDates = new Set<string>()

    const sessions = yearSessions.data || []

    sessions.forEach((session: any) => {
        const date = session.started_at.split('T')[0]
        const mins = session.duration / 60
        heatmapDataMap.set(date, (heatmapDataMap.get(date) || 0) + mins)
        uniqueDates.add(date)
    })

    const heatmapData = Array.from(heatmapDataMap.entries()).map(([date, value]) => ({
        date,
        value
    }))

    // 3. Streak Calculation
    let streak = 0
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Check if streak is active (has data for today or yesterday)
    let currentDateStr: string | null = uniqueDates.has(todayStr) ? todayStr : (uniqueDates.has(yesterdayStr) ? yesterdayStr : null)

    if (currentDateStr) {
        streak = 1
        while (true) {
            const checkDate: Date = new Date(currentDateStr!)
            checkDate.setDate(checkDate.getDate() - 1)
            const prevDateStr: string = checkDate.toISOString().split('T')[0]
            if (uniqueDates.has(prevDateStr)) {
                streak++
                currentDateStr = prevDateStr
            } else {
                break
            }
        }
    }

    // 4. Achievement Calculation
    const achievements: string[] = []

    // Early Bird (5-9 AM)
    const hasEarlyBird = sessions.some((s: any) => {
        const h = new Date(s.started_at).getHours()
        return h >= 5 && h < 9
    })
    if (hasEarlyBird) achievements.push('earlyBird')

    // Night Owl (22-02) - Note: 0-2 is next day technically but simple check suits
    const hasNightOwl = sessions.some((s: any) => {
        const h = new Date(s.started_at).getHours()
        return h >= 22 || h < 2
    })
    if (hasNightOwl) achievements.push('nightOwl')

    return {
        todayMinutes: Math.round(todayMinutes),
        yesterdayMinutes: Math.round(yesterdayMinutes),
        weekMinutes: Math.round(weekMinutes),
        totalTasks: totalTasks.count || 0,
        completedTasks: completedTasks.count || 0,
        heatmapData,
        totalMinutes: Math.round(totalMinutes),
        streak,
        achievements
    }
}

export async function getHistorySessions(dateFilter?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    let query = supabase
        .from('pomodoro_sessions')
        .select('*, tasks(title)')
        .eq('user_id', user.id)
        .eq('completed', true)

    if (dateFilter) {
        // Filter by specific day (00:00 to 23:59)
        const startDate = new Date(dateFilter)
        // Validate date
        if (!isNaN(startDate.getTime())) {
            const endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + 1)

            query = query
                .gte('started_at', startDate.toISOString())
                .lt('started_at', endDate.toISOString())
        }
    } else {
        query = query.limit(50)
    }

    const { data: sessions, error } = await query.order('started_at', { ascending: false })

    if (error) {
        console.error('Error fetching history sessions:', error)
        return []
    }

    return sessions || []
}
