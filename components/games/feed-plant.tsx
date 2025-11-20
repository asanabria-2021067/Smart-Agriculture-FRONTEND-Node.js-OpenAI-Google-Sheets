"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Apple, Droplets, Sun, Cookie } from "lucide-react"

const FOODS = [
  { icon: Apple, name: "Manzana", color: "bg-red-500", points: 10 },
  { icon: Droplets, name: "Agua", color: "bg-blue-500", points: 15 },
  { icon: Sun, name: "Luz solar", color: "bg-yellow-500", points: 20 },
  { icon: Cookie, name: "Fertilizante", color: "bg-amber-600", points: 25 },
]

export default function FeedPlant() {
  const [hunger, setHunger] = useState(100)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [feedingEffect, setFeedingEffect] = useState<string | null>(null)
  const [plantSize, setPlantSize] = useState(1)

  useEffect(() => {
    if (gameOver) return

    const interval = setInterval(() => {
      setHunger((prev) => {
        const newHunger = Math.max(0, prev - 1)
        if (newHunger === 0) {
          setGameOver(true)
        }
        return newHunger
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameOver])

  const feedPlant = (food: (typeof FOODS)[0]) => {
    if (gameOver) return

    const newHunger = Math.min(100, hunger + 20)
    setHunger(newHunger)
    setScore((prev) => prev + food.points)
    setFeedingEffect(food.name)
    setPlantSize((prev) => Math.min(2, prev + 0.05))

    setTimeout(() => setFeedingEffect(null), 1000)
  }

  const resetGame = () => {
    setHunger(100)
    setScore(0)
    setGameOver(false)
    setFeedingEffect(null)
    setPlantSize(1)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <Card className="p-8 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="text-8xl transition-transform duration-300" style={{ transform: `scale(${plantSize})` }}>
            🌱
          </div>

          {feedingEffect && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-green-600 dark:text-green-400 animate-bounce">
              +{FOODS.find((f) => f.name === feedingEffect)?.points}
            </div>
          )}

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hambre</span>
              <span className="font-bold">{hunger}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hunger > 50 ? "bg-green-500" : hunger > 20 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${hunger}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 w-full">
        {FOODS.map((food) => {
          const Icon = food.icon
          return (
            <Button
              key={food.name}
              onClick={() => feedPlant(food)}
              disabled={gameOver}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <div className={`w-10 h-10 ${food.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs">{food.name}</span>
            </Button>
          )
        })}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        ¡Alimenta tu planta antes de que el hambre llegue a 0!
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive w-full">
          <h3 className="text-xl font-bold mb-2">¡Tu planta se marchitó!</h3>
          <p className="text-muted-foreground mb-4">Puntuación final: {score}</p>
          <Button onClick={resetGame} className="w-full">
            Intentar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}
