"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplets } from "lucide-react"

export default function WaterPlant() {
  const [waterLevel, setWaterLevel] = useState(50)
  const [targetZone, setTargetZone] = useState({ min: 40, max: 60 })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isWatering, setIsWatering] = useState(false)
  const [round, setRound] = useState(1)
  const [attempts, setAttempts] = useState(3)

  const generateNewTarget = useCallback(() => {
    const min = Math.floor(Math.random() * 50) + 20
    const max = min + 20
    setTargetZone({ min, max })
    setWaterLevel(0)
  }, [])

  useEffect(() => {
    if (isWatering && !gameOver) {
      const interval = setInterval(() => {
        setWaterLevel((prev) => Math.min(100, prev + 2))
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isWatering, gameOver])

  const startWatering = () => {
    if (gameOver) return
    setIsWatering(true)
  }

  const stopWatering = () => {
    if (!isWatering || gameOver) return

    setIsWatering(false)

    if (waterLevel >= targetZone.min && waterLevel <= targetZone.max) {
      const accuracy = 100 - Math.abs(waterLevel - (targetZone.min + targetZone.max) / 2)
      const points = Math.round(accuracy * round)
      setScore((prev) => prev + points)
      setRound((prev) => prev + 1)
      generateNewTarget()
    } else {
      setAttempts((prev) => {
        const newAttempts = prev - 1
        if (newAttempts === 0) {
          setGameOver(true)
        }
        return newAttempts
      })
      setWaterLevel(0)
    }
  }

  const resetGame = () => {
    setWaterLevel(50)
    setTargetZone({ min: 40, max: 60 })
    setScore(0)
    setGameOver(false)
    setIsWatering(false)
    setRound(1)
    setAttempts(3)
  }

  const isInTarget = waterLevel >= targetZone.min && waterLevel <= targetZone.max

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Ronda</div>
          <div className="text-2xl font-bold">{round}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Intentos</div>
          <div className="text-2xl font-bold">{"❤️".repeat(attempts)}</div>
        </div>

        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <Card className="p-8 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="text-7xl">🌺</div>

          <div className="relative w-full h-64 bg-white/50 dark:bg-black/30 rounded-lg overflow-hidden border-4 border-gray-300 dark:border-gray-700">
            <div
              className="absolute top-0 left-0 right-0 bg-red-200/50 dark:bg-red-900/30 border-b-2 border-red-400"
              style={{ height: `${targetZone.min}%` }}
            />

            <div
              className="absolute left-0 right-0 bg-green-200/50 dark:bg-green-900/30 border-y-2 border-green-500"
              style={{
                top: `${targetZone.min}%`,
                height: `${targetZone.max - targetZone.min}%`,
              }}
            >
              <div className="flex items-center justify-center h-full text-xs font-bold text-green-700 dark:text-green-300">
                ZONA PERFECTA
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 bg-red-200/50 dark:bg-red-900/30 border-t-2 border-red-400"
              style={{ height: `${100 - targetZone.max}%` }}
            />

            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-100 ${
                isInTarget ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ height: `${waterLevel}%` }}
            >
              <div className="flex items-center justify-center h-full">
                <Droplets className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-2xl font-bold text-gray-700 dark:text-gray-300 pointer-events-none">
              {waterLevel}%
            </div>
          </div>

          <Button
            onMouseDown={startWatering}
            onMouseUp={stopWatering}
            onTouchStart={startWatering}
            onTouchEnd={stopWatering}
            disabled={gameOver}
            size="lg"
            className="w-full h-16 text-lg"
          >
            <Droplets className="w-6 h-6 mr-2" />
            {isWatering ? "Regando..." : "Mantén presionado para regar"}
          </Button>
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Mantén presionado el botón y suéltalo cuando el nivel esté en la zona verde
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive w-full">
          <h3 className="text-xl font-bold mb-2">¡Juego Terminado!</h3>
          <p className="text-muted-foreground mb-4">Puntuación final: {score}</p>
          <p className="text-sm text-muted-foreground mb-4">Llegaste a la ronda {round}</p>
          <Button onClick={resetGame} className="w-full">
            Intentar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}
