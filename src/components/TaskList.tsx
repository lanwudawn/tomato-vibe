'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, Circle, GripVertical, Lightbulb } from 'lucide-react'
import { Task } from '@/types'
import { clsx } from 'clsx'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface TaskListProps {
  tasks: Task[]
  onAddTask: (title: string) => void
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
  const [editingTitle, setEditingTitle] = useState('')

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim())
      setNewTaskTitle('')
    }
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="task-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all',
                        activeTaskId === task.id
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                        task.completed
                          ? 'opacity-60'
                          : '',
                        snapshot.isDragging && 'shadow-lg ring-2 ring-red-500'
                      )}
                      onClick={() => onSelectTask?.({ id: task.id, title: task.title })}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                      >
                        <GripVertical size={18} />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleTask(task.id)
                        }}
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
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {activeTaskId === task.id && (
                            <span className="text-red-500 flex-shrink-0">▶</span>
                          )}
                          <span
                            className={clsx(
                              'flex-1 cursor-text truncate',
                              task.completed
                                ? 'text-gray-400 line-through'
                                : 'text-gray-900 dark:text-white'
                            )}
                          >
                            {task.title}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {task.completed_pomodoros}/{task.estimated_pomodoros || '∞'}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteTask(task.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </Draggable>
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
