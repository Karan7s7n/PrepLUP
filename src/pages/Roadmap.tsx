import { useState } from "react"
import { generateRoadmap, saveRoadmap } from "../services/roadmapService"
import { useAuthStore } from "../store/authStore"

export default function Roadmap() {
  const { user } = useAuthStore()

  const [role, setRole] = useState("frontend")
  const [days, setDays] = useState(7)
  const [plan, setPlan] = useState<any[]>([])

  const handleGenerate = async () => {
    const p = generateRoadmap(role, days)
    setPlan(p)

    await saveRoadmap(user.id, role, days, p)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Roadmap Generator</h1>

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
      </select>

      <input
        type="number"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
      />

      <button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-2 rounded">
        Generate
      </button>

      <div>
        {plan.map((p) => (
          <div key={p.day} className="p-3 border rounded my-2">
            Day {p.day}: {p.task}
          </div>
        ))}
      </div>
    </div>
  )
}
