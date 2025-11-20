"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf, Apple } from "lucide-react"

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

type Position = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

const FOOD_EMOJIS = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍒", "🍑", "🥝"]

export default function PlantSnake() {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT")
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [currentFoodEmoji, setCurrentFoodEmoji] = useState("🍎")
  const [gameStarted, setGameStarted] = useState(false)

  const generateFood = useCallback(() => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    
    setFood(newFood)
    setCurrentFoodEmoji(FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)])
  }, [snake])

  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }

    return body.some((segment) => segment.x === head.x && segment.y === head.y)
  }, [])

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return

    setDirection(nextDirection)

    setSnake((prevSnake) => {
      const head = prevSnake[0]
      let newHead: Position

      switch (nextDirection) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 }
          break
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 }
          break
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y }
          break
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y }
          break
      }

      if (checkCollision(newHead, prevSnake.slice(1))) {
        setGameOver(true)
        if (score > highScore) {
          setHighScore(score)
        }
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake]

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => {
          const newScore = s + 10
          if (newScore > highScore) {
            setHighScore(newScore)
          }
          return newScore
        })
        setSpeed((s) => Math.max(50, s - 3))
        generateFood()
        return newSnake
      }

      newSnake.pop()
      return newSnake
    })
  }, [nextDirection, food, gameOver, isPaused, generateFood, checkCollision, score, highScore, gameStarted])

  useEffect(() => {
    const interval = setInterval(moveSnake, speed)
    return () => clearInterval(interval)
  }, [moveSnake, speed])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && !gameOver) {
        setGameStarted(true)
      }

      if (gameOver) return

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault()
          if (direction !== "DOWN") {
            setNextDirection("UP")
          }
          break
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault()
          if (direction !== "UP") {
            setNextDirection("DOWN")
          }
          break
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault()
          if (direction !== "RIGHT") {
            setNextDirection("LEFT")
          }
          break
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault()
          if (direction !== "LEFT") {
            setNextDirection("RIGHT")
          }
          break
        case "p":
        case "P":
        case " ":
          e.preventDefault()
          setIsPaused((p) => !p)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [direction, gameOver, gameStarted])

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ])
    setDirection("RIGHT")
    setNextDirection("RIGHT")
    setFood({ x: 15, y: 15 })
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
    setSpeed(INITIAL_SPEED)
    setGameStarted(false)
    setCurrentFoodEmoji(FOOD_EMOJIS[0])
  }

  const handleDirectionButton = (dir: Direction) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true)
    }
    
    if (gameOver) return

    switch (dir) {
      case "UP":
        if (direction !== "DOWN") setNextDirection("UP")
        break
      case "DOWN":
        if (direction !== "UP") setNextDirection("DOWN")
        break
      case "LEFT":
        if (direction !== "RIGHT") setNextDirection("LEFT")
        break
      case "RIGHT":
        if (direction !== "LEFT") setNextDirection("RIGHT")
        break
    }
  }

  const getSegmentStyle = (index: number) => {
    if (index === 0) {
      return "bg-green-600 dark:bg-green-500 rounded-full scale-110 shadow-lg"
    }
    const opacity = 100 - (index * 2)
    return `bg-green-500 dark:bg-green-600 rounded-sm opacity-${Math.max(40, opacity)}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Longitud</div>
          <div className="text-2xl font-bold">{snake.length}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Récord</div>
          <div className="text-2xl font-bold">{highScore}</div>
        </div>

        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>

        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" disabled={!gameStarted || gameOver}>
          {isPaused ? "▶️" : "⏸️"}
        </Button>
      </div>

      <Card className="p-2 bg-gradient-to-br from-green-100 to-lime-100 dark:from-green-950 dark:to-lime-950">
        <div
          className="relative border-4 border-green-700 dark:border-green-500 bg-green-50 dark:bg-green-900/30"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            const isSnake = snake.findIndex((s) => s.x === x && s.y === y)
            const isFood = food.x === x && food.y === y
            const isHead = isSnake === 0

            return (
              <div
                key={index}
                className={`
                  border border-green-200/20 dark:border-green-800/20
                  flex items-center justify-center
                  transition-all duration-100
                  ${isSnake >= 0 ? getSegmentStyle(isSnake) : ""}
                `}
              >
                {isHead && <Leaf className="w-3 h-3 text-white" />}
                {isFood && (
                  <span className="text-xl animate-bounce">{currentFoodEmoji}</span>
                )}
              </div>
            )
          })}

          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="text-white text-center space-y-2 bg-green-800/90 p-6 rounded-lg">
                <div className="text-3xl mb-2">🌿 Plant Snake 🐍</div>
                <div className="text-sm">Presiona cualquier tecla o botón para comenzar</div>
              </div>
            </div>
          )}

          {isPaused && !gameOver && gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-white text-center space-y-2 bg-green-800/90 p-6 rounded-lg">
                <div className="text-2xl font-bold">⏸️ PAUSA</div>
                <div className="text-sm">Presiona P o Espacio para continuar</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 w-64">
        <div></div>
        <Button
          onClick={() => handleDirectionButton("UP")}
          disabled={gameOver}
          variant="outline"
          className="h-16"
        >
          ⬆️
        </Button>
        <div></div>
        
        <Button
          onClick={() => handleDirectionButton("LEFT")}
          disabled={gameOver}
          variant="outline"
          className="h-16"
        >
          ⬅️
        </Button>
        
        <Button
          onClick={() => setIsPaused(!isPaused)}
          disabled={!gameStarted || gameOver}
          variant="outline"
          className="h-16"
        >
          {isPaused ? "▶️" : "⏸️"}
        </Button>
        
        <Button
          onClick={() => handleDirectionButton("RIGHT")}
          disabled={gameOver}
          variant="outline"
          className="h-16"
        >
          ➡️
        </Button>
        
        <div></div>
        <Button
          onClick={() => handleDirectionButton("DOWN")}
          disabled={gameOver}
          variant="outline"
          className="h-16"
        >
          ⬇️
        </Button>
        <div></div>
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>Flechas o WASD: Mover | P/Espacio: Pausar</div>
        <div>¡Come frutas para crecer y aumentar tu puntuación! 🍎</div>
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive w-full">
          <h3 className="text-xl font-bold mb-2">🐍 ¡Game Over! 💥</h3>
          <p className="text-muted-foreground mb-2">Puntuación final: {score}</p>
          <p className="text-muted-foreground mb-4">Longitud alcanzada: {snake.length} segmentos</p>
          {score === highScore && score > 0 && (
            <p className="text-green-600 dark:text-green-400 mb-4 font-bold">
              ¡Nuevo récord! 🏆
            </p>
          )}
          <Button onClick={resetGame} className="w-full">
            Jugar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}