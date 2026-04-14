import { useEffect, useState } from "react"

export function useTimer(duration: number) {
  const [time, setTime] = useState(duration)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => (t > 0 ? t - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return time
}
