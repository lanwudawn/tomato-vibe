'use client'

import { Clock, Calendar, Target, TrendingUp, Award, Zap } from 'lucide-react'
import Link from 'next/link'
import { Heatmap } from '@/components/Heatmap'
import { useLanguage } from '@/contexts/LanguageContext'

interface StatsViewProps {
    stats: {
        todayMinutes: number
        weekMinutes: number
        totalTasks: number
        completedTasks: number
        heatmapData: { date: string; value: number }[]
        totalMinutes: number
    }
}

export function StatsView({ stats }: StatsViewProps) {
    const { t } = useLanguage()

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
            return `${hours}${t('hours' as any) || 'h'} ${mins}${t('minutes')}`
        }
        return `${mins}${t('minutes')}`
    }

    // Achievement Logic
    const getBadge = (minutes: number) => {
        if (minutes >= 6000) return {
            name: t('badge_flowMaster' as any),
            icon: Zap,
            color: 'text-yellow-500',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            desc: t('badge_flowMaster_desc' as any)
        }
        if (minutes >= 3000) return {
            name: t('badge_focusExpert' as any),
            icon: Award,
            color: 'text-purple-500',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            desc: t('badge_focusExpert_desc' as any)
        }
        if (minutes >= 600) return {
            name: t('badge_advancedWalker' as any),
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            desc: t('badge_advancedWalker_desc' as any)
        }
        return {
            name: t('badge_beginner' as any),
            icon: Target,
            color: 'text-green-500',
            bg: 'bg-green-100 dark:bg-green-900/30',
            desc: t('badge_beginner_desc' as any)
        }
    }

    const badge = getBadge(stats.totalMinutes)

    const cards = [
        {
            title: t('todayFocus' as any),
            value: formatTime(stats.todayMinutes),
            icon: Clock,
            color: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
        {
            title: t('weekFocus' as any),
            value: formatTime(stats.weekMinutes),
            icon: Calendar,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            title: t('completedTasks' as any),
            value: `${stats.completedTasks}/${stats.totalTasks}`,
            icon: Target,
            color: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            title: t('completionRate' as any),
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
                        {t('return' as any)}
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📊 {t('statsTitle' as any)}
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
                                        {t('currentBadge' as any)}
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
                            {t('focusHeatmap' as any)}
                        </h2>
                        <Heatmap data={stats.heatmapData} />
                    </section>
                </main>
            </div>
        </div>
    )
}
