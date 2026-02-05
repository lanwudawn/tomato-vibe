'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { getTasks, createTask as saveTaskToDB, updateTask as updateTaskInDB, deleteTask as deleteTaskFromDB } from '@/lib/supabase/tasks'
import { saveSession } from '@/lib/supabase/sessions'

function PomodoroApp() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { settings, updateSettings, resetToDefaults } = usePomodoroSettings()

  const [tasks, setTasks] = useState<Task[]>([])
  const [isDark, setIsDark] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [activeTask, setActiveTask] = useState<{ id: string; title: string } | null>(null)

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
    onSessionComplete: async (sessionMode, duration, taskId) => {
      if (user) {
        await saveSession({ mode: sessionMode, duration })
      }
      if (sessionMode === 'focus' && taskId) {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          const newCount = (task.completed_pomodoros || 0) + 1
          await handleUpdateTask(taskId, { completed_pomodoros: newCount })
        }
      }
    },
    taskId: activeTask?.id,
  })

  const loadTasks = useCallback(async () => {
    const data = await getTasks()
    setTasks(data)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        loadTasks()
      }, 0)
      return () => clearTimeout(timeoutId)
    } else {
      const timeoutId = setTimeout(() => {
        setTasks([])
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [user, loadTasks])

  const handleAddTask = async (title: string) => {
    const tempTaskId = crypto.randomUUID()
    const tempTask: Task = {
      id: tempTaskId,
      user_id: user?.id || 'demo-user',
      title,
      completed_pomodoros: 0,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks(prev => [tempTask, ...prev])

    if (user) {
      const savedTask = await saveTaskToDB({ title })
      if (savedTask) {
        setTasks(prev => prev.map(t => t.id === tempTaskId ? savedTask : t))
      } else {
        setTasks(prev => prev.filter(t => t.id !== tempTaskId))
      }
    }
  }

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const previousCompleted = task.completed
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    )

    if (user) {
      const success = await updateTaskInDB(id, { completed: !previousCompleted })
      if (!success) {
        setTasks(prev =>
          prev.map(t =>
            t.id === id ? { ...t, completed: previousCompleted } : t
          )
        )
      }
    }
  }

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))

    if (user && taskToDelete) {
      const success = await deleteTaskFromDB(id)
      if (!success) {
        setTasks(prev => [...prev, taskToDelete])
      }
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const previousTask = { ...task }
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )
    )

    if (user) {
      const success = await updateTaskInDB(id, updates)
      if (!success) {
        setTasks(prev => prev.map(t => t.id === id ? previousTask : t))
      }
    }
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
                activeTask={activeTask}
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
              activeTaskId={activeTask?.id}
              onSelectTask={setActiveTask}
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
