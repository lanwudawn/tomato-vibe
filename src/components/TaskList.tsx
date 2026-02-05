'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, Circle } from 'lucide-react'
import { Task } from '@/types'
import { clsx } from 'clsx'

interface TaskListProps {
  tasks: Task[]
  loading?: boolean
  onAddTask: (title: string) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
}

export function TaskList({
  tasks,
  loading = false,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim())
      setNewTaskTitle('')
    }
  }

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      onUpdateTask(id, { title: editingTitle.trim() })
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) {
        handleSaveEdit(editingId)
      } else {
        handleAddTask()
      }
    }
    if (e.key === 'Escape' && editingId) {
      setEditingId(null)
      setEditingTitle('')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加新任务..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-red-500 outline-none"
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim()}
          className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium
                     hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600
                     transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-lg border transition-all',
              task.completed
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
            )}
          >
            <button
              onClick={() => onToggleTask(task.id)}
              className={clsx(
                'flex-shrink-0 transition-colors',
                task.completed ? 'text-green-500' : 'text-gray-400 hover:text-red-500'
              )}
            >
              {task.completed ? <Check size={20} /> : <Circle size={20} />}
            </button>

            {editingId === task.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                onBlur={() => handleSaveEdit(task.id)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
              />
            ) : (
              <span
                onClick={() => handleStartEdit(task)}
                className={clsx(
                  'flex-1 cursor-text',
                  task.completed
                    ? 'text-gray-400 line-through'
                    : 'text-gray-900 dark:text-white'
                )}
              >
                {task.title}
              </span>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {task.completed_pomodoros}/{task.estimated_pomodoros || '∞'}
              </span>
            </div>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          还没有任务，添加一个开始吧！
        </div>
      )}
    </div>
  )
}
