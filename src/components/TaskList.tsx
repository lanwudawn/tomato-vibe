'use client'

import { useState, useCallback } from 'react'
import { Plus, Lightbulb } from 'lucide-react'
import { Task } from '@/types'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onAddTask: (title: string, estimatedPomodoros?: number) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onReorderTasks: (tasks: Task[]) => void
  activeTaskId?: string | null
  onSelectTask?: (task: { id: string; title: string } | null) => void
}

export function TaskList({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onReorderTasks,
  activeTaskId,
  onSelectTask,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      // Parse for quick add format: "Title #3" -> title="Title", estimate=3
      const regex = /^(.*?)\s*#(\d+)$/
      const match = newTaskTitle.trim().match(regex)

      if (match) {
        onAddTask(match[1], parseInt(match[2]))
      } else {
        onAddTask(newTaskTitle.trim())
      }
      setNewTaskTitle('')
    }
  }

  const handleSaveEdit = useCallback((id: string, newTitle: string) => {
    if (newTitle.trim()) {
      onUpdateTask(id, { title: newTitle.trim() })
    }
    setEditingId(null)
  }, [onUpdateTask])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleStartEdit = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }))

    onReorderTasks(updatedItems)
  }

  const addExampleTask = () => {
    onAddTask('阅读 25 分钟')
  }

  return (
    <div
      className="w-full max-w-md mx-auto"
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) {
          document.querySelector<HTMLInputElement>('input[placeholder="添加新任务..."]')?.focus()
        }
      }}
    >
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="task-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  isActive={activeTaskId === task.id}
                  isEditing={editingId === task.id}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onSelect={(t) => onSelectTask?.(t)}
                  onEditSave={handleSaveEdit}
                  onEditCancel={handleCancelEdit}
                  onEditStart={handleStartEdit}
                  onUpdateEstimate={(id, estimate) => onUpdateTask(id, { estimated_pomodoros: estimate })}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {tasks.length === 0 && (
        <div className="text-center py-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center animate-pulse">
                <Lightbulb size={40} className="text-yellow-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                开始你的专注之旅 🚀
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                番茄钟帮你进入心流状态，每一次专注都是成长的积累。
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={addExampleTask}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600
                           text-white font-medium hover:from-red-600 hover:to-red-700 transition-all
                           shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>✨</span>
                <span>添加示例：阅读 25 分钟</span>
              </button>
              <p className="text-xs text-gray-400">
                或者直接在输入框中输入你的任务
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
