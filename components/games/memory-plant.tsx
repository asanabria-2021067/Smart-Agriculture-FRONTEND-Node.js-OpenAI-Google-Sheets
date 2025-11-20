"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PLANTS = ["🌵", "🌻", "🌹", "🌷", "🌺", "🌸", "🪴", "🌿"]

type CardType = { id: number; plant: string; flipped: boolean; matched: boolean }

export default function MemoryPlant() {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const selectedPlants = PLANTS.slice(0, 6)
    const duplicatedPlants = [...selectedPlants, ...selectedPlants]
    const shuffled = duplicatedPlants
      .map((plant, index) => ({
        id: index,
        plant,
        flipped: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5)

    setCards(shuffled)
    setFlippedCards([])
    setScore(0)
    setMoves(0)
    setGameOver(false)
  }

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const firstCard = cards[first]
      const secondCard = cards[second]

      if (firstCard.plant === secondCard.plant) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second ? { ...card, matched: true, flipped: true } : card,
            ),
          )
          setScore((prev) => prev + 100)
          setFlippedCards([])

          if (cards.filter((c) => !c.matched).length === 2) {
            setTimeout(() => setGameOver(true), 500)
          }
        }, 500)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === first || card.id === second ? { ...card, flipped: false } : card)),
          )
          setFlippedCards([])
        }, 1000)
      }
      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, cards])

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) {
      return
    }

    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, flipped: true } : card)))
    setFlippedCards((prev) => [...prev, id])
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Movimientos</div>
          <div className="text-2xl font-bold">{moves}</div>
        </div>

        <Button onClick={initializeGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.matched || card.flipped}
              className={`
                w-16 h-16 rounded-lg flex items-center justify-center text-4xl
                transition-all duration-300 transform
                ${
                  card.flipped || card.matched
                    ? "bg-white dark:bg-gray-800 scale-100"
                    : "bg-purple-400 dark:bg-purple-700 hover:scale-105 cursor-pointer"
                }
                ${card.matched ? "opacity-60" : "opacity-100"}
              `}
            >
              {card.flipped || card.matched ? card.plant : "❓"}
            </button>
          ))}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center">¡Encuentra todos los pares de plantas!</div>

      {gameOver && (
        <Card className="p-6 text-center bg-primary/10 w-full">
          <h3 className="text-xl font-bold mb-2">¡Felicidades!</h3>
          <p className="text-muted-foreground mb-2">Puntuación: {score}</p>
          <p className="text-muted-foreground mb-4">Movimientos: {moves}</p>
          <Button onClick={initializeGame} className="w-full">
            Jugar de nuevo
          </Button>
        </Card>
      )}
    </div>
  )
}
