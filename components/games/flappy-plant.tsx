"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const GAME_HEIGHT = 400
const PIPE_WIDTH = 60
const PIPE_GAP = 150
const PLANT_SIZE = 40

type Pipe = { x: number; topHeight: number; scored: boolean }

export default function FlappyPlant() {
  const [plantY, setPlantY] = useState(GAME_HEIGHT / 2)
  const [velocity, setVelocity] = useState(0)
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const jump = useCallback(() => {
    if (gameOver) return
    if (!gameStarted) {
      setGameStarted(true)
    }
    setVelocity(-8)
  }, [gameOver, gameStarted])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      setPlantY((prev) => {
        const newY = prev + velocity
        if (newY <= 0 || newY >= GAME_HEIGHT - PLANT_SIZE) {
          setGameOver(true)
          return prev
        }
        return newY
      })
      setVelocity((prev) => prev + 0.5)

      setPipes((prev) => {
        const newPipes = prev
          .map((pipe) => ({ ...pipe, x: pipe.x - 3 }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH)

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 300) {
          const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50
          newPipes.push({ x: 400, topHeight, scored: false })
        }

        return newPipes
      })
    }, 20)

    return () => clearInterval(gameLoop)
  }, [velocity, gameStarted, gameOver])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    pipes.forEach((pipe) => {
      const plantLeft = 20
      const plantRight = 20 + PLANT_SIZE
      const pipeLeft = pipe.x
      const pipeRight = pipe.x + PIPE_WIDTH

      if (plantRight > pipeLeft && plantLeft < pipeRight) {
        if (plantY < pipe.topHeight || plantY + PLANT_SIZE > pipe.topHeight + PIPE_GAP) {
          setGameOver(true)
        }
      }

      if (!pipe.scored && pipe.x + PIPE_WIDTH < 20) {
        setPipes(prevPipes => 
          prevPipes.map(p => 
            p.x === pipe.x ? { ...p, scored: true } : p
          )
        )
        setScore((prev) => prev + 1)
      }
    })
  }, [pipes, plantY, gameStarted, gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [jump])

  const resetGame = () => {
    setPlantY(GAME_HEIGHT / 2)
    setVelocity(0)
    setPipes([])
    setScore(0)
    setGameOver(false)
    setGameStarted(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <Card
        className="relative bg-gradient-to-b from-sky-300 to-sky-400 dark:from-sky-900 dark:to-sky-950 overflow-hidden cursor-pointer"
        style={{ width: 400, height: GAME_HEIGHT }}
        onClick={jump}
      >
        <div
          className="absolute w-10 h-10 flex items-center justify-center text-3xl transition-all duration-75"
          style={{
            left: 20,
            top: plantY,
            transform: `rotate(${Math.min(velocity * 5, 45)}deg)`,
          }}
        >
          🌿
        </div>

        {pipes.map((pipe, index) => (
          <div key={index}>
            <div
              className="absolute bg-green-600 dark:bg-green-800 border-4 border-green-700 dark:border-green-900"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
              }}
            />
            <div
              className="absolute bg-green-600 dark:bg-green-800 border-4 border-green-700 dark:border-green-900"
              style={{
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
              }}
            />
          </div>
        ))}

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-white text-center space-y-2">
              <div className="text-2xl font-bold">Flappy Plant</div>
              <div className="text-sm">Haz clic o presiona ESPACIO para volar</div>
            </div>
          </div>
        )}
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Haz clic o presiona ESPACIO para mantener tu planta volando
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive w-full">
          <h3 className="text-xl font-bold mb-2">¡Chocaste!</h3>
          <p className="text-muted-foreground mb-4">Puntuación: {score}</p>
          <Button onClick={resetGame} className="w-full">
            Intentar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}