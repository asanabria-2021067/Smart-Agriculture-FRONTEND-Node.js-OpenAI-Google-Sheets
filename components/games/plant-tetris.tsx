"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const PLANT_SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
]

const PLANT_COLORS = [
  "bg-green-500",
  "bg-green-600", 
  "bg-green-700",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-600"
]

type Board = number[][]
type Piece = { shape: number[][]; x: number; y: number; color: number }

export default function PlantTetris() {
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [dropSpeed, setDropSpeed] = useState(500)

  const createNewPiece = useCallback((): Piece => {
    const shapeIndex = Math.floor(Math.random() * PLANT_SHAPES.length)
    return {
      shape: PLANT_SHAPES[shapeIndex],
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(PLANT_SHAPES[shapeIndex][0].length / 2),
      y: 0,
      color: shapeIndex,
    }
  }, [])

  const checkCollision = useCallback(
    (piece: Piece, newX: number, newY: number): boolean => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardX = newX + x
            const boardY = newY + y

            if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
              return true
            }

            if (boardY >= 0 && board[boardY][boardX]) {
              return true
            }
          }
        }
      }
      return false
    },
    [board]
  )

  const mergePiece = useCallback(
    (piece: Piece) => {
      const newBoard = board.map((row) => [...row])

      piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = piece.y + y
            const boardX = piece.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = piece.color + 1
            }
          }
        })
      })

      return newBoard
    },
    [board]
  )

  const clearLines = useCallback((newBoard: Board) => {
    let linesCleared = 0
    const clearedBoard = newBoard.filter((row) => {
      if (row.every((cell) => cell !== 0)) {
        linesCleared++
        return false
      }
      return true
    })

    while (clearedBoard.length < BOARD_HEIGHT) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] || 100
      setScore((prev) => prev + points * level)
      setLines((prev) => {
        const newLines = prev + linesCleared
        const newLevel = Math.floor(newLines / 10) + 1
        if (newLevel > level) {
          setLevel(newLevel)
          setDropSpeed(Math.max(100, 500 - (newLevel - 1) * 50))
        }
        return newLines
      })
    }

    return clearedBoard
  }, [level])

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver || isPaused) return

      const newX = currentPiece.x + dx
      const newY = currentPiece.y + dy

      if (!checkCollision(currentPiece, newX, newY)) {
        setCurrentPiece({ ...currentPiece, x: newX, y: newY })
      } else if (dy > 0) {
        const newBoard = mergePiece(currentPiece)
        const clearedBoard = clearLines(newBoard)
        setBoard(clearedBoard)

        const newPiece = createNewPiece()
        if (checkCollision(newPiece, newPiece.x, newPiece.y)) {
          setGameOver(true)
        } else {
          setCurrentPiece(newPiece)
        }
      }
    },
    [currentPiece, gameOver, isPaused, checkCollision, mergePiece, clearLines, createNewPiece]
  )

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map((row) => row[i]).reverse()
    )

    const rotatedPiece = { ...currentPiece, shape: rotated }
    
    if (!checkCollision(rotatedPiece, rotatedPiece.x, rotatedPiece.y)) {
      setCurrentPiece(rotatedPiece)
    } else {
      for (let offset of [-1, 1, -2, 2]) {
        if (!checkCollision(rotatedPiece, rotatedPiece.x + offset, rotatedPiece.y)) {
          setCurrentPiece({ ...rotatedPiece, x: rotatedPiece.x + offset })
          return
        }
      }
    }
  }, [currentPiece, gameOver, isPaused, checkCollision])

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let newY = currentPiece.y
    while (!checkCollision(currentPiece, currentPiece.x, newY + 1)) {
      newY++
    }

    const droppedPiece = { ...currentPiece, y: newY }
    const newBoard = mergePiece(droppedPiece)
    const clearedBoard = clearLines(newBoard)
    setBoard(clearedBoard)

    const newPiece = createNewPiece()
    if (checkCollision(newPiece, newPiece.x, newPiece.y)) {
      setGameOver(true)
    } else {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, gameOver, isPaused, checkCollision, mergePiece, clearLines, createNewPiece])

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      setCurrentPiece(createNewPiece())
    }
  }, [currentPiece, gameOver, createNewPiece])

  useEffect(() => {
    if (gameOver || isPaused) return

    const interval = setInterval(() => {
      movePiece(0, 1)
    }, dropSpeed)

    return () => clearInterval(interval)
  }, [movePiece, gameOver, isPaused, dropSpeed])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          movePiece(-1, 0)
          break
        case "ArrowRight":
          e.preventDefault()
          movePiece(1, 0)
          break
        case "ArrowDown":
          e.preventDefault()
          movePiece(0, 1)
          break
        case "ArrowUp":
          e.preventDefault()
          rotatePiece()
          break
        case " ":
          e.preventDefault()
          hardDrop()
          break
        case "p":
        case "P":
          e.preventDefault()
          setIsPaused((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiece, rotatePiece, hardDrop, gameOver])

  const resetGame = () => {
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0))
    )
    setCurrentPiece(null)
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
    setDropSpeed(500)
  }

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = currentPiece.y + y
            const boardX = currentPiece.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color + 1
            }
          }
        })
      })
    }

    return displayBoard
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Nivel</div>
          <div className="text-2xl font-bold">{level}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Líneas</div>
          <div className="text-2xl font-bold">{lines}</div>
        </div>

        <Button onClick={resetGame} variant="outline" size="sm">
          Reiniciar
        </Button>

        <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm">
          {isPaused ? "▶" : "⏸"}
        </Button>
      </div>

      <Card className="p-2 bg-gray-100 dark:bg-gray-900">
        <div
          className="grid gap-[1px]"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
          }}
        >
          {renderBoard().map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`w-5 h-5 border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-colors ${
                  cell ? PLANT_COLORS[cell - 1] : "bg-white dark:bg-gray-950"
                }`}
              >
                {cell > 0 && <Leaf className="w-3 h-3 text-white/50" />}
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>← → Mover | ↑ Rotar | ↓ Bajar | Espacio: Caída rápida | P: Pausar</div>
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive">
          <h3 className="text-xl font-bold mb-2">¡Juego Terminado!</h3>
          <p className="text-muted-foreground mb-2">Puntuación final: {score}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Nivel: {level} | Líneas: {lines}
          </p>
          <Button onClick={resetGame} className="w-full">
            Jugar de nuevo
          </Button>
        </Card>
      )}

      {isPaused && !gameOver && (
        <Card className="p-6 text-center bg-primary/10">
          <h3 className="text-xl font-bold">Juego en Pausa</h3>
          <p className="text-sm text-muted-foreground mt-2">Presiona P para continuar</p>
        </Card>
      )}
    </div>
  )
}