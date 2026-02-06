import { useState } from 'react'
import { X, Settings, Volume2, Music, Zap, Volume1 } from 'lucide-react'
import { PomodoroSettings } from '@/types'

interface SettingsPanelProps {
  settings: PomodoroSettings
  onSettingsChange: (settings: Partial<PomodoroSettings>) => void
  onReset: () => void
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onReset,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                   hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">设置</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  专注时长（分钟）
                </label>
                <input
                  type="number"
                  value={settings.focusDuration}
                  onChange={e => onSettingsChange({ focusDuration: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  短休息时长（分钟）
                </label>
                <input
                  type="number"
                  value={settings.shortBreakDuration}
                  onChange={e => onSettingsChange({ shortBreakDuration: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  长休息时长（分钟）
                </label>
                <input
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={e => onSettingsChange({ longBreakDuration: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  长休息前的专注次数
                </label>
                <input
                  type="number"
                  value={settings.sessionsBeforeLongBreak}
                  onChange={e => onSettingsChange({ sessionsBeforeLongBreak: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    开启久坐提醒
                  </label>
                  <button
                    onClick={() => onSettingsChange({ sedentaryReminderEnabled: !settings.sedentaryReminderEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ring-offset-white dark:ring-offset-gray-800 ${settings.sedentaryReminderEnabled ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.sedentaryReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                {settings.sedentaryReminderEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      提醒间隔（分钟）
                    </label>
                    <input
                      type="number"
                      value={settings.sedentaryReminderInterval}
                      onChange={e => onSettingsChange({ sedentaryReminderInterval: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="240"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Sound Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Volume2 size={16} />
                  提示音效
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      类型
                    </label>
                    <select
                      value={settings.soundType}
                      onChange={e => onSettingsChange({ soundType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white
                                 outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="bell">清脆铃声</option>
                      <option value="digital">电子音</option>
                      <option value="wood">木鱼声</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      音量 ({Math.round((settings.soundVolume || 0.5) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.soundVolume || 0.5}
                      onChange={e => onSettingsChange({ soundVolume: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* White Noise Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Music size={16} />
                  白噪音
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      环境音
                    </label>
                    <select
                      value={settings.whiteNoiseType}
                      onChange={e => onSettingsChange({ whiteNoiseType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white
                                 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">关闭</option>
                      <option value="rain">雨声</option>
                      <option value="forest">森林</option>
                      <option value="cafe">咖啡馆</option>
                    </select>
                  </div>
                  {settings.whiteNoiseType !== 'none' && (
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        音量 ({Math.round((settings.whiteNoiseVolume || 0.5) * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.whiteNoiseVolume || 0.5}
                        onChange={e => onSettingsChange({ whiteNoiseVolume: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Haptics Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Zap size={16} />
                    触感反馈 (震动)
                  </label>
                  <button
                    onClick={() => onSettingsChange({ hapticsEnabled: !settings.hapticsEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ring-offset-white dark:ring-offset-gray-800 ${settings.hapticsEnabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onReset}
                  className="w-full py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600
                             text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700
                             transition-colors"
                >
                  恢复默认设置
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-red-500 text-white font-bold
                             hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all
                             active:scale-95"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
