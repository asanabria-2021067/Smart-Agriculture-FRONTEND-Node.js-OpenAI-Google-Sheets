"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import { ChevronLeft, ChevronRight, MessageCircle, Droplets, Heart, Sparkles, Activity, AlertCircle, RefreshCw, Gamepad2, BarChart3, Apple } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { API_CONFIG, getMacetaApiUrl, apiRequest } from "@/lib/config"
import Plant3D, { CactusPlant, LeafyPlant } from "@/components/plant-3d"
import PlantChatModal from "@/components/plant-chat-modal"
import GamesModal from "@/components/games-modal"

interface MacetaProfile {
  id: number
  name: string
  plantType: string
  emoji: string
  health: {
    score: number
    status: string
    mood: string
  }
  currentData: {
    temperatura: number
    humedadSuelo: number
    humedadAire: number
    luz: boolean
  }
  stats: {
    avgTemperatura: number
    avgHumedadSuelo: number
    avgHumedadAire: number
    totalRiegos: number
    lastRiego: string
  }
  personality: {
    trait: string
    description: string
  }
}

const PLANT_COMPONENTS = [
  { component: Plant3D, position: [0, -1, 0] as [number, number, number], scale: 1 },
  { component: CactusPlant, position: [0, -0.5, 0] as [number, number, number], scale: 1.5 },
  { component: LeafyPlant, position: [0, -0.5, 0] as [number, number, number], scale: 1.5 },
]

export default function Plants() {
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0)
  const [plants, setPlants] = useState<MacetaProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)
  const [touching, setTouching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [watering, setWatering] = useState(false)

  useEffect(() => {
    fetchPlantsData()
    const interval = setInterval(fetchPlantsData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchPlantsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
const overview = await apiRequest(API_CONFIG.endpoints.macetas)
      
      if (overview.success && overview.data) {
        setPlants(overview?.data)
      }
    } catch (error) {
      console.error("Error fetching plants:", error)
      setError(error instanceof Error ? error.message : "Error de conexión con el backend")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setCurrentPlantIndex((prev) => (prev + 1) % 3)
  }

  const handlePrev = () => {
    setCurrentPlantIndex((prev) => (prev - 1 + 3) % 3)
  }

  const handleTouch = () => {
    setTouching(true)
    setTimeout(() => setTouching(false), 1000)
  }

  const handleWater = async () => {
    if (!currentPlant || watering) return
    
    setWatering(true)
    try {
      const response = await apiRequest(
        getMacetaApiUrl(API_CONFIG.endpoints.potWater, currentPlant.id),
        {
          method: "POST",
          body: JSON.stringify({ amount: 100, duration: 5 })
        }
      )
      
      if (response.success) {
        // Refresh plant data
        await fetchPlantsData()
      }
    } catch (error) {
      console.error("Error watering plant:", error)
    } finally {
      setTimeout(() => setWatering(false), 2000)
    }
  }

  const currentPlant = plants[currentPlantIndex]
  const PlantComponent = PLANT_COMPONENTS[currentPlantIndex]

  if (error && plants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-green-100 via-blue-50 to-green-100 dark:from-green-950 dark:via-background dark:to-green-950">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">No se pudo conectar al backend</h3>
            <p className="text-sm text-muted-foreground mb-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Para ver tus plantas, el backend debe estar corriendo en:
            </p>
            <code className="block mt-2 text-xs bg-muted p-2 rounded">
              http://localhost:3000
            </code>
          </div>
          <Button onClick={fetchPlantsData} className="w-full" disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            {loading ? "Conectando..." : "Reintentar Conexión"}
          </Button>
        </Card>
      </div>
    )
  }

  if (loading && plants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 via-blue-50 to-green-100 dark:from-green-950 dark:via-background dark:to-green-950">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando tus plantas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-100 via-blue-50 to-green-100 dark:from-green-950 dark:via-background dark:to-green-950 relative overflow-hidden">
      
      {/* Top Indicators - Similar a My Talking Tom */}
      {currentPlant && (
        <div className="absolute top-4 left-0 right-0 z-20 px-4">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            {/* Health Score */}
            <Card className="px-3 py-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg border-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-bold text-lg">{currentPlant?.health?.score}</span>
              </div>
            </Card>

            {/* Plant Switcher */}
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPlantIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentPlantIndex 
                      ? "bg-green-600 dark:bg-green-500 w-6" 
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            {/* Water Count */}
            <Card className="px-3 py-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg border-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-lg">{currentPlant?.stats?.totalRiegos}</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Main Plant Display - Center Stage */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 pt-20 pb-32">
        <div className="w-full max-w-xl relative">
          {currentPlant && (
            <>
              {/* Plant Name and Mood */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center z-30 -mt-8">
                <h2 className="text-3xl font-bold flex items-center gap-2 justify-center">
                  <span>{currentPlant?.emoji}</span>
                  <span>{currentPlant?.name}</span>
                </h2>
                <Badge className="mt-2 text-sm px-4 py-1 bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50">
                  {currentPlant?.health?.mood}
                </Badge>
              </div>

              {/* 3D Plant - Large center display */}
              <div 
                className={cn(
                  "h-[450px] cursor-pointer transition-all duration-300 relative",
                  touching && "scale-95"
                )}
                onClick={handleTouch}
              >
                <Canvas>
                  <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 1, 5]} />
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[10, 10, 5]} intensity={1.2} />
                    <Environment preset="sunset" />
                    
                    {PlantComponent && (
                      <PlantComponent.component 
                        position={PlantComponent.position} 
                        scale={PlantComponent.scale * 1.3} 
                      />
                    )}
                    
                    <OrbitControls 
                      enableZoom={false} 
                      enablePan={false} 
                      autoRotate 
                      autoRotateSpeed={2}
                    />
                  </Suspense>
                </Canvas>
                
                {/* Touch effect */}
                {touching && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <Heart className="w-24 h-24 text-red-500 animate-ping" />
                  </div>
                )}

                {/* Watering animation */}
                {watering && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <Droplets className="w-32 h-32 text-blue-500 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Navigation arrows */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-xl border-2 w-12 h-12"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-xl border-2 w-12 h-12"
                onClick={handleNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons - My Talking Tom Style */}
      {currentPlant && (
        <div className="absolute bottom-20 left-0 right-0 z-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-around gap-2">
              {/* Stats Button */}
              <button
                className="flex flex-col items-center gap-1 group"
                onClick={() => {}}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 transition-transform hover:scale-110 active:scale-95">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Stats</span>
              </button>

              {/* Chat Button */}
              <button
                className="flex flex-col items-center gap-1 group"
                onClick={() => setChatOpen(true)}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 transition-transform hover:scale-110 active:scale-95">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Chat</span>
              </button>

              {/* Water Button - MAIN ACTION */}
              <button
                className="flex flex-col items-center gap-1 group"
                onClick={handleWater}
                disabled={watering}
              >
                <div className={cn(
                  "w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 dark:from-cyan-500 dark:to-blue-700 flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 transition-transform hover:scale-110 active:scale-95",
                  watering && "animate-pulse scale-95"
                )}>
                  <Droplets className="w-10 h-10 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground font-bold">Regar</span>
              </button>

              {/* Feed Button */}
              <button
                className="flex flex-col items-center gap-1 group"
                onClick={() => {}}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 transition-transform hover:scale-110 active:scale-95">
                  <Apple className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Feed</span>
              </button>

              {/* Games Button */}
              <button
                className="flex flex-col items-center gap-1 group"
                onClick={() => setGamesOpen(true)}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 transition-transform hover:scale-110 active:scale-95">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Juegos</span>
              </button>
            </div>

            {/* Stats Bar Below Buttons */}
            <Card className="mt-4 p-3 bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Temp</div>
                  <div className="text-lg font-bold">{currentPlant?.currentData?.temperatura.toFixed(1)}°</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">H. Suelo</div>
                  <div className="text-lg font-bold">{currentPlant?.currentData?.humedadSuelo.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">H. Aire</div>
                  <div className="text-lg font-bold">{currentPlant?.currentData?.humedadAire.toFixed(0)}%</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {currentPlant && (
        <PlantChatModal
          open={chatOpen}
          onOpenChange={setChatOpen}
          macetaId={currentPlant?.id}
          plantName={currentPlant?.name}
          plantEmoji={currentPlant?.emoji}
        />
      )}

      {/* Games Modal */}
      {currentPlant && (
        <GamesModal
          open={gamesOpen}
          onOpenChange={setGamesOpen}
          plantName={currentPlant.name}
        />
      )}
    </div>
  )
}
