import { MousePointer2, Keyboard, Wind, Maximize2, CheckCircle2 } from 'lucide-react'

export function AuraGuide() {
    const guides = [
        {
            title: '极简操作',
            icon: <MousePointer2 className="text-tomato" size={18} />,
            content: '点击中心计时器即可开始，再次点击暂停。',
        },
        {
            title: '专注目标',
            icon: <CheckCircle2 className="text-green-500" size={18} />,
            content: '点击任务标题设为目标，完成后自动累计番茄数。',
        },
        {
            title: '沉浸氛围',
            icon: <Maximize2 className="text-blue-500" size={18} />,
            content: '全屏模式下支持环境白噪音，助你快速进入心流。',
        },
        {
            title: '高效习惯',
            icon: <Wind className="text-cyan-500" size={18} />,
            content: '开启久坐提醒，在专注与休息间寻找完美平衡。',
        },
    ]

    const shortcuts = [
        { label: '开始 / 暂停', key: 'Space' },
        { label: '重置计时', key: 'R' },
        { label: '调整时长', key: '+ / -' },
    ]

    return (
        <section className="w-full max-w-2xl mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">使用秘籍</h3>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 px-4">
                {guides.map((guide, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                            {guide.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{guide.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{guide.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-[32px] bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                    <Keyboard size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">快捷键绑定</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
                            <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-gray-800 text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
