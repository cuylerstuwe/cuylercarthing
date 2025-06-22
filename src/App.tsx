import React, { useEffect, useState, useRef } from 'react'

type Mode = 'setup' | 'running' | 'finished'

const pad = (n: number) => n.toString().padStart(2, '0')

// Update this hash whenever UI tweaks are made so testers can confirm they're on the latest build.
const CHANGE_HASH = '9f3c'

const App: React.FC = () => {
    // Timer length picked by user (seconds)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)

    // Remaining time in seconds
    const [remaining, setRemaining] = useState(0)

    const [mode, setMode] = useState<Mode>('setup')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Start the countdown
    const startTimer = () => {
        const totalSeconds = minutes * 60 + seconds
        if (totalSeconds <= 0) return
        setRemaining(totalSeconds)
        setMode('running')
    }

    // Cancel timer back to setup
    const cancelTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        setMode('setup')
        setRemaining(0)
    }

    // Handle ticking
    useEffect(() => {
        if (mode !== 'running') return

        intervalRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    intervalRef.current = null
                    setMode('finished')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [mode])

    // Helpers to increment/decrement with bounds
    const inc = (setter: React.Dispatch<React.SetStateAction<number>>, val: number, max: number) => {
        setter(v => (v + val + (max + 1)) % (max + 1))
    }

    // Render different screens
    const renderSetup = () => (
        <div className="flex flex-col items-center space-y-10">
            <div className="flex text-white text-6xl select-none space-x-24">
                {/* Minutes picker */}
                <div className="flex flex-col items-center">
                    <button className="active:scale-95 bg-gray-700 w-24 h-24 flex items-center justify-center rounded-xl text-4xl" onClick={() => inc(setMinutes, 1, 59)}>▲</button>
                    <span className="my-4 w-24 text-center text-5xl">{pad(minutes)}</span>
                    <button className="active:scale-95 bg-gray-700 w-24 h-24 flex items-center justify-center rounded-xl text-4xl" onClick={() => inc(setMinutes, -1, 59)}>▼</button>
                    <span className="text-sm mt-2">min</span>
                </div>
                {/* Seconds picker */}
                <div className="flex flex-col items-center">
                    <button className="active:scale-95 bg-gray-700 w-24 h-24 flex items-center justify-center rounded-xl text-4xl" onClick={() => inc(setSeconds, 10, 59)}>▲</button>
                    <span className="my-4 w-24 text-center text-5xl">{pad(seconds)}</span>
                    <button className="active:scale-95 bg-gray-700 w-24 h-24 flex items-center justify-center rounded-xl text-4xl" onClick={() => inc(setSeconds, -10, 59)}>▼</button>
                    <span className="text-sm mt-2">sec</span>
                </div>
            </div>
            <button className="bg-green-600 hover:bg-green-700 active:scale-95 text-white text-4xl px-14 py-7 rounded-2xl mt-10" onClick={startTimer}>Start</button>
        </div>
    )

    const renderRunning = () => {
        const mins = Math.floor(remaining / 60)
        const secs = remaining % 60
        return (
            <div className="flex flex-col items-center space-y-12">
                <span className="text-white text-8xl font-mono select-none">{pad(mins)}:{pad(secs)}</span>
                <button className="bg-gray-800 hover:bg-gray-900 active:scale-95 text-white text-3xl px-10 py-4 rounded-2xl" onClick={cancelTimer}>Cancel</button>
            </div>
        )
    }

    const renderFinished = () => (
        <div className="flex flex-col items-center space-y-12 select-none" onClick={cancelTimer}>
            <span className="text-white text-8xl font-mono">00:00</span>
            <span className="text-white text-2xl">Time's up! Tap anywhere.</span>
        </div>
    )

    const bgClass = () => {
        switch (mode) {
            case 'running':
                return 'bg-green-700'
            case 'finished':
                return 'bg-red-700'
            default:
                return 'bg-slate-900'
        }
    }

    return (
        <div
            className={`${bgClass()} w-screen h-screen flex justify-center items-center relative`}
            onClick={mode === 'finished' ? cancelTimer : undefined}
        >
            {mode === 'setup' && renderSetup()}
            {mode === 'running' && renderRunning()}
            {mode === 'finished' && renderFinished()}

            {/* Change hash for quick build identification */}
            <span className="absolute bottom-2 right-2 text-xs text-white/60 select-none">
                {CHANGE_HASH}
            </span>
        </div>
    )
}

export default App
