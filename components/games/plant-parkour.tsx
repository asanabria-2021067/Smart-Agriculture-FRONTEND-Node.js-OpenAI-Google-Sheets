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
  const [isJumping, setIsJumping] = useState(false)
  const [velocity, setVelocity] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highestY, setHighestY] = useState(GAME_HEIGHT - 2)

  const isOnPlatform = useCallback(
    (pos: Position): boolean => {
      return platforms.some(
        (platform) => pos.x >= platform.x && pos.x < platform.x + platform.width && pos.y === platform.y - 1,
      )
    },
    [platforms],
  )

  const canMoveTo = useCallback((newPos: Position): boolean => {
    if (newPos.x < 0 || newPos.x >= GAME_WIDTH || newPos.y >= GAME_HEIGHT) {
      return false
    }

    return true
  }, [])

  const movePlayer = useCallback(
    (dx: number) => {
      if (gameOver) return

      const newPos = { x: playerPos.x + dx, y: playerPos.y }

      if (canMoveTo(newPos)) {
        setPlayerPos(newPos)
      }
    },
    [playerPos, canMoveTo, gameOver],
  )

  const jump = useCallback(() => {
    if (gameOver || isJumping) return

    if (isOnPlatform(playerPos)) {
      setIsJumping(true)
      setVelocity(-3)
    }
  }, [playerPos, isOnPlatform, isJumping, gameOver])

  useEffect(() => {
    if (gameOver) return

    const gravityInterval = setInterval(() => {
      setPlayerPos((prev) => {
        let newY = prev.y + 1
        let newVelocity = velocity + 0.5

        if (isJumping) {
          newY = prev.y + velocity

          if (velocity >= 0) {
            const platformBelow = platforms.find((p) => prev.x >= p.x && prev.x < p.x + p.width && newY >= p.y - 1)

            if (platformBelow) {
              newY = platformBelow.y - 1
              setIsJumping(false)
              setVelocity(0)
              newVelocity = 0
            }
          }
        } else {
          if (!isOnPlatform({ x: prev.x, y: prev.y })) {
            const platformBelow = platforms.find((p) => prev.x >= p.x && prev.x < p.x + p.width && newY >= p.y - 1)

            if (platformBelow) {
              newY = platformBelow.y - 1
            }
          } else {
            newY = prev.y
          }
        }

        if (newY >= GAME_HEIGHT) {
          setGameOver(true)
          return prev
        }

        if (newY < highestY) {
          setHighestY(newY)
          setScore((prev) => prev + 10)
        }

        setVelocity(newVelocity)
        return { ...prev, y: Math.max(0, newY) }
      })
    }, 100)

    return () => clearInterval(gravityInterval)
  }, [velocity, isJumping, platforms, isOnPlatform, gameOver, highestY])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case "ArrowLeft":
          movePlayer(-1)
          break
        case "ArrowRight":
          movePlayer(1)
          break
        case "ArrowUp":
        case " ":
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
    setIsJumping(false)
    setVelocity(0)
    setScore(0)
    setGameOver(false)
    setHighestY(GAME_HEIGHT - 2)
  }

  const renderGame = () => {
    const grid: string[][] = Array(GAME_HEIGHT)
      .fill(null)
      .map(() => Array(GAME_WIDTH).fill("empty"))

    platforms.forEach((platform) => {
      for (let i = 0; i < platform.width; i++) {
        if (platform.y >= 0 && platform.y < GAME_HEIGHT) {
          grid[platform.y][platform.x + i] = "platform"
        }
      }
    })

    if (playerPos.y >= 0 && playerPos.y < GAME_HEIGHT) {
      grid[playerPos.y][playerPos.x] = "player"
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
            )),
          )}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>← → Mover | ↑ o Espacio: Saltar</div>
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
