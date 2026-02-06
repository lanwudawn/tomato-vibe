'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface Session {
    id: string
    created_at: string
    user_id: string
    duration: number
    mode: string
    started_at: string
    completed: boolean
}

interface HistoryViewProps {
    sessions: Session[]
}

export function HistoryView({ sessions }: HistoryViewProps) {
    const { t, language } = useLanguage()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.round(seconds / 60)
        return `${minutes}${t('minutes')}`
    }

    const modeLabels: Record<string, string> = {
        focus: t('focus'),
        shortBreak: t('shortBreak'),
        longBreak: t('longBreak'),
    }

    const modeColors: Record<string, string> = {
        focus: 'text-red-500 bg-red-50 dark:bg-red-900/20',
        shortBreak: 'text-green-500 bg-green-50 dark:bg-green-900/20',
        longBreak: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <header className="flex items-center gap-4 mb-12">
                    <Link
                        href="/"
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {t('return' as any)}
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📜 {t('historyTitle' as any)}
                    </h1>
                </header>

                <main>
                    {sessions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {t('noHistory' as any)}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${modeColors[session.mode] || ''}`}>
                                                {modeLabels[session.mode] || session.mode}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {formatDate(session.started_at)}
                                            </span>
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {formatDuration(session.duration)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
