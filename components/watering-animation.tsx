"use client"

import { useEffect, useState } from "react"
import { Droplets } from "lucide-react"

export default function WateringAnimation() {
  const [drops, setDrops] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setDrops((prev) => [...prev, Date.now()])
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cleanup = setInterval(() => {
      setDrops((prev) => prev.filter((drop) => Date.now() - drop < 2000))
    }, 100)

    return () => clearInterval(cleanup)
  }, [])

  return (
    <div className="relative h-64 flex items-center justify-center">
      <div className="text-center space-y-4 grow-plant-animation">
        <div className="w-32 h-32 mx-auto rounded-full bg-primary/20 flex items-center justify-center pulse-glow-animation">
          <Droplets className="w-16 h-16 text-primary" />
        </div>
        <p className="text-lg font-semibold text-balance">Regando tu planta...</p>
        <p className="text-sm text-muted-foreground">La hidratación está en proceso</p>
      </div>

      {/* Water drops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {drops.map((drop, index) => (
          <div
            key={drop}
            className="absolute water-drop-animation"
            style={{
              left: `${30 + index * 8}%`,
              top: "20%",
              animationDelay: `${index * 0.2}s`,
            }}
          >
            <Droplets className="w-6 h-6 text-secondary" />
          </div>
        ))}
      </div>
    </div>
  )
}
