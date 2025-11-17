"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gamepad2, Grid3x3, Mountain } from 'lucide-react'
import PlantTetris from "@/components/games/plant-tetris"
import PlantParkour from "@/components/games/plant-parkour"

interface GamesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plantName: string
}

type GameType = "menu" | "tetris" | "parkour"

export default function GamesModal({ open, onOpenChange, plantName }: GamesModalProps) {
  const [currentGame, setCurrentGame] = useState<GameType>("menu")

  const handleBack = () => {
    setCurrentGame("menu")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="w-6 h-6" />
            Juegos de {plantName}
          </DialogTitle>
        </DialogHeader>

        {currentGame === "menu" && (
          <div className="p-6 pt-4 space-y-4">
            <p className="text-muted-foreground">
              ¡Juega con tu planta y gana puntos para mantenerla feliz!
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Tetris Game */}
              <Card 
                className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-primary"
                onClick={() => setCurrentGame("tetris")}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <Grid3x3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Tetris de Plantas</h3>
                  <p className="text-sm text-muted-foreground">
                    Acomoda las plantas que caen y forma líneas completas
                  </p>
                  <Button className="w-full">
                    Jugar
                  </Button>
                </div>
              </Card>

              {/* Parkour Game */}
              <Card 
                className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-primary"
                onClick={() => setCurrentGame("parkour")}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Mountain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Parkour de Plantas</h3>
                  <p className="text-sm text-muted-foreground">
                    Usa las flechas para saltar obstáculos y subir escalones
                  </p>
                  <Button className="w-full">
                    Jugar
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentGame === "tetris" && (
          <div className="p-6 pt-0">
            <Button onClick={handleBack} variant="outline" className="mb-4">
              ← Volver al menú
            </Button>
            <PlantTetris />
          </div>
        )}

        {currentGame === "parkour" && (
          <div className="p-6 pt-0">
            <Button onClick={handleBack} variant="outline" className="mb-4">
              ← Volver al menú
            </Button>
            <PlantParkour />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
