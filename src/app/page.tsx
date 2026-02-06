'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import { usePomodoroTimer, usePomodoroSettings, useSedentaryReminder } from '@/hooks'
import { useWhiteNoise } from '@/hooks/useWhiteNoise'
import { TimerDisplay } from '@/components/TimerDisplay'
import { ModeSelector } from '@/components/ModeSelector'

// 动态载入非首屏核心组件，减少主包体积
const SettingsPanel = dynamic(() => import('@/components/SettingsPanel').then(mod => mod.SettingsPanel), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
})

const TaskList = dynamic(() => import('@/components/TaskList').then(mod => mod.TaskList), {
  ssr: false,
  loading: () => <div className="h-40 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
})

const AuthForm = dynamic(() => import('@/components/AuthForm').then(mod => mod.AuthForm), {
  ssr: false
})

const WebWidget = dynamic(() => import('@/components/WebWidget').then(mod => mod.WebWidget), {
  ssr: false
})

import { useAuth } from '@/contexts/AuthContext'
import { Task } from '@/types'
import { Sun, Moon, LogOut, User as UserIcon, BarChart2, History, Layers, Maximize2, Minimize2 } from 'lucide-react'
import Link from 'next/link'
import { getTasks, createTask as saveTaskToDB, updateTask as updateTaskInDB, deleteTask as deleteTaskFromDB } from '@/lib/supabase/tasks'
import { saveSession } from '@/lib/supabase/sessions'
import { broadcastTimerState, broadcastSessionComplete, getStoredUserId } from '@/lib/supabase/broadcast'

function PomodoroApp() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { settings, updateSettings, resetToDefaults } = usePomodoroSettings()

  const [tasks, setTasks] = useState<Task[]>([])
  const [isDark, setIsDark] = useState<boolean | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [activeTask, setActiveTask] = useState<{ id: string; title: string } | null>(null)
  const [showWidget, setShowWidget] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)

  const {
    mode,
    timeLeft,
    isRunning,
    completedSessions,
    toggle,
    resetTimer,
    switchMode,
    progress,
    setTimeLeft,
  } = usePomodoroTimer({
    focusDuration: settings.focusDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    onSessionComplete: async (sessionMode, duration, taskId) => {
      if (user) {
        await saveSession({ mode: sessionMode, duration })
      }
      await broadcastSessionComplete(sessionMode, duration, taskId)
      if (sessionMode === 'focus' && taskId) {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          const newCount = (task.completed_pomodoros || 0) + 1
          await handleUpdateTask(taskId, { completed_pomodoros: newCount })
        }
      }
    },
    taskId: activeTask?.id,
    soundType: settings.soundType,
    soundVolume: settings.soundVolume,
    hapticsEnabled: settings.hapticsEnabled,
  })

  // White Noise Integration - Must be after timer to access state
  useWhiteNoise({
    type: settings.whiteNoiseType,
    volume: settings.whiteNoiseVolume,
    enabled: isRunning && mode === 'focus'
  })

  const broadcastCache = useRef({
    time: 0,
    isRunning: false,
    mode: '',
    taskId: undefined as string | undefined
  })
  useEffect(() => {
    const now = Date.now()
    const stateChanged =
      isRunning !== broadcastCache.current.isRunning ||
      mode !== broadcastCache.current.mode ||
      activeTask?.id !== broadcastCache.current.taskId

    // 状态变更（运行中/停止/切换模式/切换任务）立即同步，否则每 10 秒同步一次时间
    const shouldBroadcast = stateChanged || (now - broadcastCache.current.time > 10000)

    if (shouldBroadcast) {
      broadcastTimerState(mode, timeLeft, isRunning, activeTask, completedSessions)
      broadcastCache.current = {
        time: now,
        isRunning,
        mode,
        taskId: activeTask?.id
      }
    }
  }, [mode, timeLeft, isRunning, activeTask, completedSessions])

  const { resetReminder } = useSedentaryReminder({
    enabled: settings.sedentaryReminderEnabled,
    interval: settings.sedentaryReminderInterval,
  })

  // 当切换到休息模式时，重置久坐提醒计时
  useEffect(() => {
    if (mode === 'shortBreak' || mode === 'longBreak') {
      resetReminder()
    }
  }, [mode, resetReminder])

  const loadTasks = useCallback(async () => {
    const data = await getTasks()
    setTasks(data)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
    } else {
      setIsDark(false)
    }
  }, [])

  useEffect(() => {
    if (isDark === null) return

    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
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
      order: 0,
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

  const handleReorderTasks = useCallback((reorderedTasks: Task[]) => {
    setTasks(reorderedTasks)

    if (user) {
      const updates = reorderedTasks.map((task, index) =>
        updateTaskInDB(task.id, { order: index })
      )
      Promise.allSettled(updates)
    } else {
      localStorage.setItem('taskOrder', JSON.stringify(reorderedTasks.map(t => t.id)))
    }
  }, [user])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          toggle()
          break
        case 'r':
        case 'R':
          resetTimer()
          break
        case '+':
        case '=':
          if (mode === 'focus' && timeLeft < settings.focusDuration * 60 + 60 * 30) {
            setTimeLeft((prev: number) => Math.min(prev + 300, settings.focusDuration * 60 + 60 * 30))
          }
          break
        case '-':
          if (mode === 'focus' && timeLeft > 60) {
            setTimeLeft((prev: number) => Math.max(prev - 300, 60))
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle, resetTimer, mode, timeLeft, settings.focusDuration, setTimeLeft])

  // 不再阻塞整个页面的渲染，authLoading 仅用于某些按钮的状态
  // 保持核心计时器可以立即显示输出


  if (!user && showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <AuthForm onSuccess={() => setShowAuth(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {!isFocusMode && (
          <header className="flex flex-wrap justify-between items-center gap-4 mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              🍅 番茄钟
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
              {user ? (
                <>
                  <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                    <UserIcon size={16} />
                    <span className="text-xs sm:text-sm hidden sm:inline">{user.email}</span>
                  </div>
                  <Link
                    href="/stats"
                    className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <BarChart2 size={16} />
                  </Link>
                  <Link
                    href="/history"
                    className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <History size={16} />
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-500 text-white font-medium text-sm sm:text-base
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
                onClick={() => setShowWidget(!showWidget)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${showWidget
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <Layers size={18} />
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>
        )}

        <WebWidget isOpen={showWidget} onClose={() => setShowWidget(false)} />
        <main className="space-y-12">
          <section className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 transition-all duration-500 ${isFocusMode ? 'scale-110 py-20' : ''}`}>
            {/* Focus Mode Toggle Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title={isFocusMode ? "退出专注模式" : "进入专注模式"}
              >
                {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
            <ModeSelector
              currentMode={mode}
              onModeChange={switchMode}
              sessionsCompleted={completedSessions}
              sessionsBeforeLongBreak={settings.sessionsBeforeLongBreak}
              isRunning={isRunning}
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
                onAdjustTime={(delta) => {
                  if (mode === 'focus') {
                    setTimeLeft(prev => Math.max(60, Math.min(3600, prev + delta)))
                  }
                }}
              />
            </div>
          </section>

          {!isFocusMode && (
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
                onReorderTasks={handleReorderTasks}
                activeTaskId={activeTask?.id}
                onSelectTask={setActiveTask}
              />
            </section>
          )}
        </main>
      </div>
    </div >
  )
}

export default function Home() {
  return (
    <PomodoroApp />
  )
}
