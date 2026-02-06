import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, X, ExternalLink } from 'lucide-react'
import { usePomodoroTimer } from '@/hooks'

interface WebWidgetProps {
  isOpen: boolean
  onClose: () => void
}

export function WebWidget({ isOpen, onClose }: WebWidgetProps) {
  const { timeLeft, isRunning, mode, start, pause, resetTimer } = usePomodoroTimer({
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
})
  const [position, setPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getModeColors = () => {
    switch (mode) {
      case 'focus':
        return { bg: 'bg-white', border: 'border-red-200', text: 'text-red-500', progress: 'bg-red-500' }
      case 'shortBreak':
        return { bg: 'bg-white', border: 'border-green-200', text: 'text-green-500', progress: 'bg-green-500' }
      case 'longBreak':
        return { bg: 'bg-white', border: 'border-blue-200', text: 'text-blue-500', progress: 'bg-blue-500' }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.widget-controls')) return
    setIsDragging(true)
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: Math.max(0, moveEvent.clientX - startX),
        y: Math.max(0, moveEvent.clientY - startY),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const colors = getModeColors()
  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  if (!isOpen) return null

  return (
    <div
      ref={dragRef}
      className={`fixed z-50 rounded-xl shadow-2xl border-2 ${colors.border} bg-white/95 backdrop-blur-sm transition-shadow ${isDragging ? 'cursor-grabbing shadow-xl' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: '280px',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-500">
            {mode === 'focus' ? '专注模式' : mode === 'shortBreak' ? '短休息' : '长休息'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4">
        <div className="text-center mb-4">
          <span className={`text-4xl font-bold ${colors.text}`}>{formatTime(timeLeft)}</span>
        </div>

        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full ${colors.progress} transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-3 widget-controls">
          <button
            onClick={isRunning ? pause : start}
            className={`p-3 rounded-full ${isRunning ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            <span className="text-xs font-medium">重置</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-xl flex items-center justify-center">
        <a
          href="/"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ExternalLink size={12} />
          打开完整版
        </a>
      </div>
    </div>
  )
}
