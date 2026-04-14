import { useState, useEffect } from "react"
import { useTheme } from "../components/ui/ThemeContext"

//////////////////////////////////////////////////////
// 🎯 FOCUS DOT
//////////////////////////////////////////////////////
function FocusDot() {
  const [pos, setPos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const interval = setInterval(() => {
      setPos({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-80 border rounded-xl overflow-hidden">
      <div
        className="absolute w-4 h-4 bg-blue-400 rounded-full transition-all duration-[2000ms] ease-linear"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      />
      <p className="absolute bottom-2 w-full text-center text-sm opacity-70">
        Follow the dot with your eyes
      </p>
    </div>
  )
}

//////////////////////////////////////////////////////
// 🌈 COLOR FLOW
//////////////////////////////////////////////////////
function ColorFlow() {
  const [ripples, setRipples] = useState<any[]>([])

  const addRipple = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipples((prev) => [...prev, { id: Date.now(), x, y }])
  }

  return (
    <div
      onClick={addRipple}
      className="relative w-full h-80 border rounded-xl overflow-hidden cursor-pointer"
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute w-10 h-10 rounded-full bg-purple-400 opacity-50 animate-ping"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      <p className="absolute bottom-2 w-full text-center text-sm opacity-70">
        Tap anywhere to create calming waves
      </p>
    </div>
  )
}

//////////////////////////////////////////////////////
// ✨ PARTICLE FIELD
//////////////////////////////////////////////////////
function ParticleField() {
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    const initial = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
    setParticles(initial)
  }, [])

  return (
    <div className="relative w-full h-80 border rounded-xl overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-pulse"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        />
      ))}
      <p className="absolute bottom-2 w-full text-center text-sm opacity-70">
        Just watch and relax
      </p>
    </div>
  )
}

//////////////////////////////////////////////////////
// 🫁 BREATHING ORB (UPDATED)
//////////////////////////////////////////////////////
function BreathingOrb() {
  const [phase, setPhase] = useState("inhale")
  const [scale, setScale] = useState(1)

  useEffect(() => {
    let t: any

    if (phase === "inhale") {
      setScale(1.6)
      t = setTimeout(() => setPhase("hold"), 4000)
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("exhale"), 2000)
    } else {
      setScale(1)
      t = setTimeout(() => setPhase("inhale"), 4000)
    }

    return () => clearTimeout(t)
  }, [phase])

  return (
    <div className="flex flex-col items-center justify-center gap-10 relative">

      {/* Glow */}
      <div className="absolute w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"></div>

      {/* Orb */}
      <div
        className="relative w-64 h-64 rounded-full 
        bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-500 
        flex items-center justify-center 
        shadow-[0_0_60px_rgba(139,92,246,0.4)]
        transition-all duration-[4000ms]"
        style={{ transform: `scale(${scale})` }}
      >
        <span className="text-3xl font-semibold text-white tracking-wide capitalize">
          {phase}
        </span>
      </div>

      <p className="opacity-60 text-sm tracking-wide">
        Inhale • Hold • Exhale
      </p>
    </div>
  )
}

//////////////////////////////////////////////////////
// 🧘 STILLNESS
//////////////////////////////////////////////////////
function Stillness() {
  const [time, setTime] = useState(10)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return

    const i = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(i)
          setRunning(false)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(i)
  }, [running])

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-5xl font-bold">{time}s</h2>

      {!running && (
        <button
          onClick={() => {
            setTime(10)
            setRunning(true)
          }}
          className="px-6 py-2 bg-purple-600 rounded-xl"
        >
          Start
        </button>
      )}

      <p className="opacity-70 text-sm">
        Stay completely still and calm
      </p>
    </div>
  )
}

//////////////////////////////////////////////////////
// 💭 THOUGHT DROP
//////////////////////////////////////////////////////
function ThoughtDrop() {
  const [input, setInput] = useState("")
  const [thoughts, setThoughts] = useState<any[]>([])

  const add = () => {
    if (!input) return
    setThoughts((prev) => [...prev, { id: Date.now(), text: input, y: 0, opacity: 1 }])
    setInput("")
  }

  useEffect(() => {
    const i = setInterval(() => {
      setThoughts((prev) =>
        prev
          .map((t) => ({ ...t, y: t.y - 1, opacity: t.opacity - 0.01 }))
          .filter((t) => t.opacity > 0)
      )
    }, 30)

    return () => clearInterval(i)
  }, [])

  return (
    <div className="relative h-80 flex flex-col justify-end">
      {thoughts.map((t) => (
        <div
          key={t.id}
          className="absolute text-sm bg-white/10 px-3 py-1 rounded-full"
          style={{ transform: `translateY(${t.y}px)`, opacity: t.opacity }}
        >
          {t.text}
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 bg-white/10 border rounded"
          placeholder="Let it go..."
        />
        <button onClick={add} className="px-4 bg-purple-600 rounded">
          Release
        </button>
      </div>
    </div>
  )
}

//////////////////////////////////////////////////////
// MAIN PAGE
//////////////////////////////////////////////////////
export default function MindEase() {
  const { theme } = useTheme()
  const [active, setActive] = useState("home")

  const text = theme === "light" ? "text-gray-900" : "text-white"
  const card = theme === "light"
    ? "bg-white border shadow-sm"
    : "bg-white/10 border-white/20"

  //////////////////////////////////////////////////////
  // HOME
  //////////////////////////////////////////////////////
  if (active === "home") {
    return (
      <div className={`min-h-screen ${text} px-6`}>

        {/* HERO */}
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 relative">

          <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full"></div>

          <h1 className="text-6xl font-bold tracking-tight">
            Ease Your Mind
          </h1>

          <p className="opacity-70 max-w-md">
            Relax. Reset. Refocus.  
            Small moments of calm can change everything.
          </p>
        </div>

        {/* GRID */}
        <div className="flex justify-center pb-20 px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl w-full place-items-center">

            {[
              ["breathing","🫁 Breathing"],
              ["thoughts","💭 Thoughts"],
              ["focus","🎯 Focus"],
              ["color","🌈 Color Flow"],
              ["particles","✨ Particles"],
              ["still","🧘 Stillness"]
            ].map(([key,label]) => (
              <div
                key={key}
                onClick={() => setActive(key)}
                className={`
                  w-56 h-32 flex items-center justify-center text-center
                  rounded-2xl cursor-pointer
                  backdrop-blur-xl border
                  transition-all duration-300
                  hover:scale-110 hover:-translate-y-1 hover:shadow-2xl
                  ${card}
                `}
              >
                <h3 className="text-lg font-semibold tracking-wide">
                  {label}
                </h3>
              </div>
            ))}

          </div>
        </div>
      </div>
    )
  }

  //////////////////////////////////////////////////////
  // GAME SWITCH
  //////////////////////////////////////////////////////
  const renderGame = () => {
    switch (active) {
      case "breathing": return <BreathingOrb />
      case "thoughts": return <ThoughtDrop />
      case "focus": return <FocusDot />
      case "color": return <ColorFlow />
      case "particles": return <ParticleField />
      case "still": return <Stillness />
    }
  }

  //////////////////////////////////////////////////////
  // GAME VIEW
  //////////////////////////////////////////////////////
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-6 px-6 ${text}`}>
      {renderGame()}

      <button
        onClick={() => setActive("home")}
        className="px-6 py-2 border rounded-xl hover:scale-105 transition"
      >
        Back
      </button>
    </div>
  )
}