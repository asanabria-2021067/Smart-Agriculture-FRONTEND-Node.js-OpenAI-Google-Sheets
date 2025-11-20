// components/plants.tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Activity, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, MessageCircle, Droplets, Heart, Apple, Gamepad2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { API_CONFIG, getMacetaApiUrl, apiRequest, MacetaProfile } from "@/lib/config"
import PlantChatModal from "@/components/plant-chat-modal"
import GamesModal from "@/components/games-modal"

const PLANT_IMAGES = ["/plantauwu.png", "/planta2.png"]

export default function Plants() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [plants, setPlants] = useState<MacetaProfile[]>([])
  const [currentPlant, setCurrentPlant] = useState<MacetaProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPlant, setLoadingPlant] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touching, setTouching] = useState(false)
  const [watering, setWatering] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)

  const fetchPlantList = async () => {
    try {
      const res = await apiRequest<MacetaProfile[]>(API_CONFIG.endpoints.macetas)
      if (res.success && res.data) {
        // FORZAMOS SOLO LAS PRIMERAS 2 MACETAS (si hay más, las ignoramos)
        const list = res.data.slice(0, 2)
        setPlants(list)
        if (list.length > 0 && !currentPlant) {
          loadPlantDetails(list[0].macetaId, 0)
        }
      }
    } catch {
      setError("Sin conexión")
    } finally {
      setLoading(false)
    }
  }

  const loadPlantDetails = async (macetaId: string, index: number) => {
    setLoadingPlant(true)
    try {
      const res = await apiRequest<MacetaProfile>(getMacetaApiUrl(API_CONFIG.endpoints.pot, macetaId))
      if (res.success && res.data) {
        setCurrentPlant(res.data)
        setCurrentIndex(index)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPlant(false)
    }
  }

  const goToPlant = (i: number) => {
    const plant = plants[i]
    if (plant) loadPlantDetails(plant.macetaId, i)
  }

  const nextPlant = () => goToPlant((currentIndex + 1) % plants.length)
  const prevPlant = () => goToPlant((currentIndex - 1 + plants.length) % plants.length)

  const handleWater = async () => {
    if (!currentPlant || watering) return
    setWatering(true)
    try {
      await apiRequest(getMacetaApiUrl(API_CONFIG.endpoints.potWater, currentPlant.macetaId), {
        method: "POST",
        body: JSON.stringify({ amount: 100, duration: 5 }),
      })
      await loadPlantDetails(currentPlant.macetaId, currentIndex)
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setWatering(false), 2000)
    }
  }

  const handleTouch = () => {
    setTouching(true)
    setTimeout(() => setTouching(false), 800)
  }

  useEffect(() => {
    fetchPlantList()
    const interval = setInterval(fetchPlantList, 30000)
    return () => clearInterval(interval)
  }, [])

  const plantImage = PLANT_IMAGES[currentIndex % PLANT_IMAGES.length]
  const displayName = `Maceta ${currentIndex + 1}`

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-cyan-50">
      <div className="text-center">
        <Activity className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-lg">Cargando...</p>
      </div>
    </div>
  )

  if (error && plants.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-cyan-50 p-6">
      <Card className="p-8 text-center space-y-4 bg-white/90 backdrop-blur">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold">Sin conexión</h3>
        <Button onClick={fetchPlantList} size="lg">
          <RefreshCw className={cn("w-5 h-5 mr-2", loading && "animate-spin")} />
          Reintentar
        </Button>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen pb-50 bg-gradient-to-b from-green-50 via-cyan-50 to-green-50 relative overflow-hidden">

      {/* Top Bar */}
      <div className="absolute top-6 left-0 right-0 z-50 px-8">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Card className="px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 animate-pulse" />
              <span className="text-2xl font-bold">{currentPlant?.healthScore ?? 0}</span>
            </div>
          </Card>

          <div className="flex gap-3">
            {plants.map((_, i) => (
              <button key={i} onClick={() => goToPlant(i)}>
                <div className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  i === currentIndex ? "bg-green-600 w-10" : "bg-gray-400"
                )} />
              </button>
            ))}
          </div>

          <Card className="px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl">
            <div className="flex items-center gap-2">
              <Droplets className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold">{currentPlant?.stats24h?.riego?.totalRiegos ?? 0}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Planta + Nombre */}
      <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-32 px-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-gray-800 drop-shadow-md">{displayName}</h1>
          {currentPlant && (
            <Badge className="mt-3 px-6 py-2 text-base bg-green-100 text-green-700 border-green-300">
              {currentPlant.mood || "Creciendo"}
            </Badge>
          )}
        </div>

        {/* Imagen de la planta */}
        <div className="relative">
          <div
            className={cn(
              "w-80 h-80 cursor-pointer transition-all duration-300",
              touching && "scale-95",
              watering && "animate-bounce"
            )}
            onClick={handleTouch}
          >
            <Image
              src={plantImage}
              alt={displayName}
              fill
              priority
              className="object-contain drop-shadow-2xl"
            />

            {/* Corazones al tocar */}
            {touching && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <Heart key={i} className="absolute text-red-500 text-5xl animate-ping opacity-80"
                    style={{ animationDelay: `${i * 100}ms`, transform: `rotate(${i * 60}deg) translateY(-50px)` }}
                  />
                ))}
              </div>
            )}

            {/* Gotas al regar */}
            {watering && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <Droplets key={i} className="absolute text-blue-500 text-5xl animate-bounce"
                    style={{ left: `${15 + i * 10}%`, top: "-10px", animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Flechas (solo si hay 2 macetas) */}
          {plants.length === 2 && (
            <>
              <Button variant="ghost" size="icon" className="absolute left-[-15vh] top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur shadow-lg w-12 h-12 cursor-pointer" onClick={prevPlant}>
                <ChevronLeft className="w-7 h-7" />
              </Button>
              <Button variant="ghost" size="icon" className="absolute right-[-15vh] top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur shadow-lg w-12 h-12 cursor-pointer" onClick={nextPlant}>
                <ChevronRight className="w-7 h-7" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Botones inferiores */}
      <div className="absolute bottom-25 left-0 right-0 px-8 z-50">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-center gap-8">

            <button onClick={() => setChatOpen(true)} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl border-4 border-white flex items-center justify-center hover:scale-110 transition">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-gray-600">Chat</span>
            </button>

            <button onClick={handleWater} disabled={watering} className="flex flex-col items-center gap-2 -mt-4">
              <div className={cn("w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl border-6 border-white flex items-center justify-center transition-all", watering && "animate-pulse")}>
                <Droplets className="w-11 h-11 text-white" />
              </div>
              <span className="text-base font-bold text-gray-800">Regar</span>
            </button>

            <button onClick={() => setGamesOpen(true)} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-xl border-4 border-white flex items-center justify-center hover:scale-110 transition">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-gray-600">Juegos</span>
            </button>
          </div>

          {/* Stats */}
          {currentPlant && (
            <Card className="p-6 bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-gray-600">Temperatura</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(currentPlant.current?.temperatura ?? currentPlant.stats24h?.temperatura?.actual ?? 0).toFixed(1)}°C
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Humedad Suelo</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(currentPlant.current?.humedadSuelo ?? currentPlant.stats24h?.humedadSuelo?.actual ?? 0).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Humedad Aire</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(currentPlant.current?.humedadAire ?? currentPlant.stats24h?.humedadAire?.actual ?? 0).toFixed(0)}%
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modales */}
      {currentPlant && (
        <>
          <PlantChatModal open={chatOpen} onOpenChange={setChatOpen} macetaId={currentPlant.macetaId} plantName={displayName} plantEmoji="Plant" />
          <GamesModal open={gamesOpen} onOpenChange={setGamesOpen} plantName={displayName} />
        </>
      )}
    </div>
  )
}