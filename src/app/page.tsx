'use client'

import { useState, useEffect } from 'react'
import { usePomodoroTimer, usePomodoroSettings } from '@/hooks'
import { TimerDisplay } from '@/components/TimerDisplay'
import { ModeSelector } from '@/components/ModeSelector'
import { SettingsPanel } from '@/components/SettingsPanel'
import { TaskList } from '@/components/TaskList'
import { AuthForm } from '@/components/AuthForm'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Task } from '@/types'
import { Sun, Moon, LogOut, User as UserIcon, BarChart2, History } from 'lucide-react'
import Link from 'next/link'

function PomodoroApp() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { settings, updateSettings, resetToDefaults } = usePomodoroSettings()
  const {
    mode,
    timeLeft,
    isRunning,
    completedSessions,
    toggle,
    resetTimer,
    switchMode,
    progress,
  } = usePomodoroTimer({
    focusDuration: settings.focusDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
  })

  const [tasks, setTasks] = useState<Task[]>([])
  const [isDark, setIsDark] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'demo-user',
      title,
      completed_pomodoros: 0,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
  }

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
      )
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!user && showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <AuthForm onSuccess={() => setShowAuth(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🍅 番茄钟
          </h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <UserIcon size={18} />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Link
                  href="/stats"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <BarChart2 size={18} />
                </Link>
                <Link
                  href="/history"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <History size={18} />
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium
                           hover:bg-red-600 transition-colors"
              >
                登录 / 注册
              </button>
            )}
            <SettingsPanel
              settings={settings}
              onSettingsChange={updateSettings}
              onReset={resetToDefaults}
            />
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="space-y-12">
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <ModeSelector
              currentMode={mode}
              onModeChange={switchMode}
              sessionsCompleted={completedSessions}
              sessionsBeforeLongBreak={settings.sessionsBeforeLongBreak}
            />
            <div className="mt-8">
              <TimerDisplay
                timeLeft={timeLeft}
                isRunning={isRunning}
                mode={mode}
                progress={progress()}
                onToggle={toggle}
                onReset={resetTimer}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              任务列表
            </h2>
            <TaskList
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          </section>
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <PomodoroApp />
    </AuthProvider>
  )
}
