'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { Check, Circle, GripVertical, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { Task } from '@/types'

interface TaskItemProps {
    task: Task
    index: number
    isActive: boolean
    isEditing: boolean
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onSelect: (task: { id: string; title: string }) => void
    onEditSave: (id: string, title: string) => void
    onEditCancel: () => void
    onEditStart: (id: string) => void
    onUpdateEstimate?: (id: string, estimate: number) => void
}

export const TaskItem = memo(function TaskItem({
    task,
    index,
    isActive,
    isEditing,
    onToggle,
    onDelete,
    onSelect,
    onEditSave,
    onEditCancel,
    onEditStart,
    onUpdateEstimate,
}: TaskItemProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [localTitle, setLocalTitle] = useState(task.title)

    useEffect(() => {
        if (isEditing) {
            setLocalTitle(task.title)
            // Focus after render
            requestAnimationFrame(() => inputRef.current?.focus())
        }
    }, [isEditing, task.title])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onEditSave(task.id, localTitle)
        }
        if (e.key === 'Escape') {
            onEditCancel()
        }
    }

    const handleBlur = () => {
        // Delay slightly to allow escape key to trigger cancel if needed, 
        // but usually blur saves or cancels. 
        // Original behavior: onBlur={() => handleSaveEdit(task.id)}
        // We will save on blur.
        onEditSave(task.id, localTitle)
    }

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={clsx(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all',
                        isActive
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                        task.completed ? 'opacity-60' : '',
                        snapshot.isDragging && 'shadow-lg ring-2 ring-red-500'
                    )}
                    onClick={() => onSelect({ id: task.id, title: task.title })}
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
                            onToggle(task.id)
                        }}
                        className={clsx(
                            'flex-shrink-0 transition-colors',
                            task.completed ? 'text-green-500' : 'text-gray-400 hover:text-red-500'
                        )}
                    >
                        {task.completed ? <Check size={20} /> : <Circle size={20} />}
                    </button>

                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                        />
                    ) : (
                        <div
                            className="flex items-center gap-2 flex-1 min-w-0"
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                onEditStart(task.id)
                            }}
                        >
                            {isActive && (
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

                    <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded transition-colors ${task.estimated_pomodoros && task.completed_pomodoros > task.estimated_pomodoros
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                            {task.completed_pomodoros}
                            <span className="mx-1">/</span>
                            <input
                                type="number"
                                min="0"
                                max="99"
                                className="w-6 bg-transparent outline-none text-center hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
                                value={task.estimated_pomodoros || ''}
                                placeholder="∞"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    onUpdateEstimate?.(task.id, isNaN(val) ? 0 : val)
                                }}
                            />
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(task.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </Draggable>
    )
})
