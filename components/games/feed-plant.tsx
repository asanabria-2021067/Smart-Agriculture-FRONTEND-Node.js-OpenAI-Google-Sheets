"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Apple, Droplets, Sun, Cookie } from "lucide-react"

const FOODS = [
  { icon: Apple, name: "Manzana", color: "bg-red-500", points: 10, nutrition: 15 },
  { icon: Droplets, name: "Agua", color: "bg-blue-500", points: 15, nutrition: 20 },
  { icon: Sun, name: "Luz solar", color: "bg-yellow-500", points: 20, nutrition: 25 },
  { icon: Cookie, name: "Fertilizante", color: "bg-amber-600", points: 25, nutrition: 30 },
]

export default function FeedPlant() {
  const [nutrition, setNutrition] = useState(100)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [feedingEffect, setFeedingEffect] = useState<string | null>(null)
  const [plantSize, setPlantSize] = useState(1)
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (gameOver) return

    const nutritionInterval = setInterval(() => {
      setNutrition((prev) => {
        const newNutrition = Math.max(0, prev - 2)
        if (newNutrition === 0) {
          setGameOver(true)
        }
        return newNutrition
      })
    }, 1000)

    return () => clearInterval(nutritionInterval)
  }, [gameOver])

  useEffect(() => {
    if (gameOver || timeLeft === 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, timeLeft])

  const feedPlant = (food: (typeof FOODS)[0]) => {
    if (gameOver) return

    const newNutrition = Math.min(100, nutrition + food.nutrition)
    setNutrition(newNutrition)
    setScore((prev) => prev + food.points)
    setFeedingEffect(food.name)
    setPlantSize((prev) => Math.min(2, prev + 0.05))

    setTimeout(() => setFeedingEffect(null), 1000)
  }

  const resetGame = () => {
    setNutrition(100)
    setScore(0)
    setGameOver(false)
    setFeedingEffect(null)
    setPlantSize(1)
    setTimeLeft(60)
  }

  const getPlantEmoji = () => {
    if (plantSize < 1.2) return "🌱"
    if (plantSize < 1.5) return "🌿"
    if (plantSize < 1.8) return "🪴"
    return "🌳"
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Tiempo</div>
          <div className="text-2xl font-bold">{timeLeft}s</div>
        </div>

        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <Card className="p-8 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="text-8xl transition-all duration-500" style={{ transform: `scale(${plantSize})` }}>
            {getPlantEmoji()}
          </div>

          {feedingEffect && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-green-600 dark:text-green-400 animate-bounce">
              +{FOODS.find((f) => f.name === feedingEffect)?.points}
            </div>
          )}

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nutrición</span>
              <span className="font-bold">{nutrition}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  nutrition > 50 ? "bg-green-500" : nutrition > 20 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${nutrition}%` }}
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
              <span className="text-xs">{food.name} (+{food.points})</span>
            </Button>
          )
        })}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        ¡Alimenta tu planta antes de que la nutrición llegue a 0!<br/>
        Consigue la mayor puntuación en 60 segundos
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive w-full">
          <h3 className="text-xl font-bold mb-2">
            {nutrition === 0 ? "¡Tu planta se marchitó!" : "¡Tiempo terminado!"}
          </h3>
          <p className="text-muted-foreground mb-4">Puntuación final: {score}</p>
          <Button onClick={resetGame} className="w-full">
            Intentar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}