"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gamepad2, Grid3x3, Mountain, Apple, Sparkles, Droplets, Brain, Bird } from "lucide-react"
import PlantTetris from "@/components/games/plant-tetris"
import PlantParkour from "@/components/games/plant-parkour"
import FeedPlant from "@/components/games/feed-plant"
import CleanPlant from "@/components/games/clean-plant"
import WaterPlant from "@/components/games/water-plant"
import MemoryPlant from "@/components/games/memory-plant"
import FlappyPlant from "@/components/games/flappy-plant"

interface GamesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plantName: string
}

type GameType = "menu" | "tetris" | "parkour" | "feed" | "clean" | "water" | "memory" | "flappy"

export default function GamesModal({ open, onOpenChange, plantName }: GamesModalProps) {
  const [currentGame, setCurrentGame] = useState<GameType>("menu")

  const handleBack = () => {
    setCurrentGame("menu")
  }

  const games = [
    {
      id: "feed" as GameType,
      title: "Alimentar Planta",
      description: "Dale comida antes de que el hambre llegue a 0",
      icon: Apple,
      gradient: "from-red-400 to-red-600",
    },
    {
      id: "clean" as GameType,
      title: "Limpiar Planta",
      description: "Haz clic en la suciedad para mantenerla limpia",
      icon: Sparkles,
      gradient: "from-yellow-400 to-yellow-600",
    },
    {
      id: "water" as GameType,
      title: "Regar Planta",
      description: "Mantén presionado y suelta en el momento perfecto",
      icon: Droplets,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      id: "memory" as GameType,
      title: "Memoria de Plantas",
      description: "Encuentra todos los pares de plantas iguales",
      icon: Brain,
      gradient: "from-purple-400 to-purple-600",
    },
    {
      id: "flappy" as GameType,
      title: "Flappy Plant",
      description: "Mantén tu planta volando sin chocar",
      icon: Bird,
      gradient: "from-cyan-400 to-cyan-600",
    },
    {
      id: "tetris" as GameType,
      title: "Tetris de Plantas",
      description: "Acomoda las plantas y forma líneas completas",
      icon: Grid3x3,
      gradient: "from-green-400 to-green-600",
    },
    {
      id: "parkour" as GameType,
      title: "Parkour de Plantas",
      description: "Salta obstáculos y sube lo más alto posible",
      icon: Mountain,
      gradient: "from-teal-400 to-teal-600",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="w-6 h-6" />
            Juegos de {plantName}
          </DialogTitle>
        </DialogHeader>

        {currentGame === "menu" && (
          <div className="p-6 pt-4 space-y-4">
            <p className="text-muted-foreground">¡Juega con tu planta y gana puntos para mantenerla feliz!</p>

            <div className="grid md:grid-cols-3 gap-4">
              {games.map((game) => {
                const Icon = game.icon
                return (
                  <Card
                    key={game.id}
                    className="p-4 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-primary"
                    onClick={() => setCurrentGame(game.id)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${game.gradient} flex items-center justify-center`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold">{game.title}</h3>
                      <p className="text-xs text-muted-foreground">{game.description}</p>
                      <Button className="w-full" size="sm">
                        Jugar
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {currentGame !== "menu" && (
          <div className="p-6 pt-0">
            <Button onClick={handleBack} variant="outline" className="mb-4 bg-transparent">
              ← Volver al menú
            </Button>
            {currentGame === "feed" && <FeedPlant />}
            {currentGame === "clean" && <CleanPlant />}
            {currentGame === "water" && <WaterPlant />}
            {currentGame === "memory" && <MemoryPlant />}
            {currentGame === "flappy" && <FlappyPlant />}
            {currentGame === "tetris" && <PlantTetris />}
            {currentGame === "parkour" && <PlantParkour />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
