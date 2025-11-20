"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

type Dirt = { id: number; x: number; y: number; cleaned: boolean }

export default function CleanPlant() {
  const [dirts, setDirts] = useState<Dirt[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)
  const [cleanliness, setCleanliness] = useState(100)
  const [combo, setCombo] = useState(0)
  const [lastCleanTime, setLastCleanTime] = useState(0)

  useEffect(() => {
    if (gameOver) return

    const initialDirt = () => {
      for (let i = 0; i < 3; i++) {
        const newDirt: Dirt = {
          id: Date.now() + i,
          x: Math.random() * 70 + 15,
          y: Math.random() * 50 + 25,
          cleaned: false,
        }
        setDirts((prev) => [...prev, newDirt])
      }
    }

    if (dirts.length === 0) {
      initialDirt()
    }

    const interval = setInterval(() => {
      const newDirt: Dirt = {
        id: Date.now(),
        x: Math.random() * 70 + 15,
        y: Math.random() * 50 + 25,
        cleaned: false,
      }
      setDirts((prev) => [...prev, newDirt])
      setCleanliness((prev) => Math.max(0, prev - 3))
    }, 2500)

    return () => clearInterval(interval)
  }, [gameOver, dirts.length])

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

  useEffect(() => {
    const now = Date.now()
    if (now - lastCleanTime > 2000) {
      setCombo(0)
    }
  }, [lastCleanTime])

  const cleanDirt = (id: number) => {
    if (gameOver) return

    const now = Date.now()
    let newCombo = combo
    
    if (now - lastCleanTime < 1000) {
      newCombo = combo + 1
    } else {
      newCombo = 1
    }
    
    setCombo(newCombo)
    setLastCleanTime(now)

    const points = 10 * newCombo
    setDirts((prev) => prev.map((d) => (d.id === id ? { ...d, cleaned: true } : d)))
    setScore((prev) => prev + points)
    setCleanliness((prev) => Math.min(100, prev + 8))

    setTimeout(() => {
      setDirts((prev) => prev.filter((d) => d.id !== id))
    }, 300)
  }

  const resetGame = () => {
    setDirts([])
    setScore(0)
    setTimeLeft(30)
    setGameOver(false)
    setCleanliness(100)
    setCombo(0)
    setLastCleanTime(0)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Tiempo</div>
          <div className="text-2xl font-bold">{timeLeft}s</div>
        </div>

        {combo > 1 && (
          <div className="text-center animate-pulse">
            <div className="text-sm text-orange-600 dark:text-orange-400">Combo</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">x{combo}</div>
          </div>
        )}

        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <Card className="relative w-full h-[400px] bg-gradient-to-b from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl">🌿</div>
        </div>

        {dirts.map((dirt) => (
          <button
            key={dirt.id}
            onClick={() => cleanDirt(dirt.id)}
            className={`absolute w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              dirt.cleaned ? "scale-0 opacity-0" : "scale-100 opacity-100 hover:scale-110"
            }`}
            style={{ left: `${dirt.x}%`, top: `${dirt.y}%` }}
            aria-label="Limpiar suciedad"
          >
            <div className="text-4xl">💩</div>
          </button>
        ))}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 dark:bg-black/90 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Limpieza
              </span>
              <span className="font-bold">{cleanliness}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  cleanliness > 70 ? "bg-green-500" : cleanliness > 40 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${cleanliness}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        ¡Haz clic en la suciedad para limpiar tu planta!<br/>
        Limpia rápido para crear combos y multiplicar tus puntos
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-primary/10 w-full">
          <h3 className="text-xl font-bold mb-2">¡Tiempo terminado!</h3>
          <p className="text-muted-foreground mb-2">Puntuación final: {score}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Limpieza final: {cleanliness}%
          </p>
          <Button onClick={resetGame} className="w-full">
            Jugar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}