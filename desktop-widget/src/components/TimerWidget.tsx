import { useState } from 'react'
import '../TimerWidget.css'

interface TimerWidgetProps {
  mode: 'focus' | 'shortBreak' | 'longBreak'
  timeLeft: number
  isRunning: boolean
  activeTaskTitle: string | null
  connected: boolean
  onClose: () => void
  onToggle: () => void
}

export function TimerWidget({
  mode,
  timeLeft,
  isRunning,
  activeTaskTitle,
  connected,
  onClose,
  onToggle,
}: TimerWidgetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
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

  const getModeColors = () => {
    switch (mode) {
      case 'focus':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', progress: 'bg-red-500' }
      case 'shortBreak':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', progress: 'bg-green-500' }
      case 'longBreak':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', progress: 'bg-blue-500' }
    }
  }

  const colors = getModeColors()

  return (
    <div
      className={`widget-container ${colors.bg} ${colors.border}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="widget-header">
        <div className="connection-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className="status-text">{connected ? '已连接' : '未连接'}</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="widget-content">
        {activeTaskTitle && mode === 'focus' && (
          <div className="task-title">{activeTaskTitle}</div>
        )}

        <div className="timer-display">
          <span className={`timer-time ${colors.text}`}>{formatTime(timeLeft)}</span>
          <span className="timer-mode">{mode === 'focus' ? '专注' : mode === 'shortBreak' ? '短休息' : '长休息'}</span>
        </div>

        <div className="progress-bar">
          <div className={`progress-fill ${colors.progress}`} style={{ width: `${isRunning ? 30 : 0}%` }} />
        </div>
      </div>

      <div className="widget-footer">
        <button className="open-btn" onClick={onToggle}>
          打开番茄钟
        </button>
      </div>
    </div>
  )
}
