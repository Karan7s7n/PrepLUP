import { useEffect, useState } from "react"
import { getLeaderboard } from "../services/leaderboardService"

type User = {
  user_id: string
  points: number
  streak: number
}

export default function Leaderboard() {
  const [data, setData] = useState<User[]>([])

  useEffect(() => {
    getLeaderboard().then((res) => {
      if (res) setData(res)
    })
  }, [])

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-bold mb-4">Leaderboard</h1>

      <div className="space-y-2">
        {data.map((u, i) => (
          <div
            key={u.user_id}
            className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <span>#{i + 1}</span>
            <span>{u.points} pts</span>
            <span>🔥 {u.streak}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
