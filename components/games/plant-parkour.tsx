"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"

const GAME_WIDTH = 15
const GAME_HEIGHT = 12

type Position = { x: number; y: number }
type Platform = { x: number; y: number; width: number }

export default function PlantParkour() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 2, y: GAME_HEIGHT - 2 })
  const [platforms, setPlatforms] = useState<Platform[]>([
    { x: 0, y: GAME_HEIGHT - 1, width: 4 },
    { x: 5, y: GAME_HEIGHT - 3, width: 3 },
    { x: 9, y: GAME_HEIGHT - 5, width: 3 },
    { x: 13, y: GAME_HEIGHT - 7, width: 2 },
  ])
  const [velocity, setVelocity] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highestY, setHighestY] = useState(GAME_HEIGHT - 2)
  const [isGrounded, setIsGrounded] = useState(true)

  const isOnPlatform = useCallback(
    (pos: Position): boolean => {
      return platforms.some(
        (platform) => 
          pos.x >= platform.x && 
          pos.x < platform.x + platform.width && 
          pos.y === platform.y - 1
      )
    },
    [platforms]
  )

  const movePlayer = useCallback(
    (dx: number) => {
      if (gameOver) return

      setPlayerPos((prev) => {
        const newX = prev.x + dx
        if (newX >= 0 && newX < GAME_WIDTH) {
          return { ...prev, x: newX }
        }
        return prev
      })
    },
    [gameOver]
  )

  const jump = useCallback(() => {
    if (gameOver || !isGrounded) return
    setVelocity(-2.5)
    setIsGrounded(false)
  }, [isGrounded, gameOver])

  useEffect(() => {
    if (gameOver) return

    const gravityInterval = setInterval(() => {
      setPlayerPos((prev) => {
        let newY = prev.y + velocity
        let newVelocity = velocity + 0.3

        if (newY >= GAME_HEIGHT) {
          setGameOver(true)
          return prev
        }

        const checkPos = { x: prev.x, y: Math.floor(newY) }
        
        if (velocity > 0 && isOnPlatform(checkPos)) {
          const platform = platforms.find(
            (p) => checkPos.x >= p.x && checkPos.x < p.x + p.width && Math.floor(newY) >= p.y - 1
          )
          if (platform) {
            newY = platform.y - 1
            newVelocity = 0
            setIsGrounded(true)
          }
        }

        if (newY < highestY) {
          const points = Math.floor((highestY - newY) * 10)
          setHighestY(newY)
          setScore((prev) => prev + points)
        }

        setVelocity(newVelocity)
        return { ...prev, y: Math.max(0, newY) }
      })
    }, 50)

    return () => clearInterval(gravityInterval)
  }, [velocity, platforms, isOnPlatform, gameOver, highestY])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          e.preventDefault()
          movePlayer(-1)
          break
        case "ArrowRight":
        case "d":
          e.preventDefault()
          movePlayer(1)
          break
        case "ArrowUp":
        case "w":
        case " ":
          e.preventDefault()
          jump()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePlayer, jump, gameOver])

  const resetGame = () => {
    setPlayerPos({ x: 2, y: GAME_HEIGHT - 2 })
    setPlatforms([
      { x: 0, y: GAME_HEIGHT - 1, width: 4 },
      { x: 5, y: GAME_HEIGHT - 3, width: 3 },
      { x: 9, y: GAME_HEIGHT - 5, width: 3 },
      { x: 13, y: GAME_HEIGHT - 7, width: 2 },
    ])
    setVelocity(0)
    setScore(0)
    setGameOver(false)
    setHighestY(GAME_HEIGHT - 2)
    setIsGrounded(true)
  }

  const renderGame = () => {
    const grid: string[][] = Array(GAME_HEIGHT)
      .fill(null)
      .map(() => Array(GAME_WIDTH).fill("empty"))

    platforms.forEach((platform) => {
      for (let i = 0; i < platform.width; i++) {
        if (platform.y >= 0 && platform.y < GAME_HEIGHT && platform.x + i < GAME_WIDTH) {
          grid[platform.y][platform.x + i] = "platform"
        }
      }
    })

    const py = Math.floor(playerPos.y)
    if (py >= 0 && py < GAME_HEIGHT && playerPos.x >= 0 && playerPos.x < GAME_WIDTH) {
      grid[py][playerPos.x] = "player"
    }

    return grid
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

      <Card className="p-4 bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-950 dark:to-sky-900">
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${GAME_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${GAME_HEIGHT}, 1fr)`,
          }}
        >
          {renderGame().map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`w-6 h-6 flex items-center justify-center ${
                  cell === "player"
                    ? "bg-green-500 rounded-full scale-110 z-10"
                    : cell === "platform"
                      ? "bg-amber-600 dark:bg-amber-700 border border-amber-700"
                      : "bg-transparent"
                }`}
              >
                {cell === "player" && <Leaf className="w-4 h-4 text-white" />}
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>← → (o A/D) Mover | ↑ (o W/Espacio): Saltar</div>
        <div>¡Sube lo más alto posible sin caer!</div>
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive">
          <h3 className="text-xl font-bold mb-2">¡Caíste!</h3>
          <p className="text-muted-foreground mb-4">Puntuación: {score}</p>
          <Button onClick={resetGame} className="w-full">
            Intentar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}