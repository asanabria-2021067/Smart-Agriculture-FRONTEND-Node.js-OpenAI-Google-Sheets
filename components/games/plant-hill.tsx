"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Fuel, Zap } from "lucide-react"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const GRAVITY = 0.5
const CAR_WIDTH = 60
const CAR_HEIGHT = 40

type Point = { x: number; y: number }
type Car = {
  x: number
  y: number
  rotation: number
  velocityX: number
  velocityY: number
  angularVelocity: number
}

export default function PlantHillClimb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [car, setCar] = useState<Car>({
    x: 100,
    y: 200,
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
    angularVelocity: 0,
  })
  const [terrain, setTerrain] = useState<Point[]>([])
  const [fuel, setFuel] = useState(100)
  const [distance, setDistance] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [keys, setKeys] = useState({ left: false, right: false })
  const [cameraX, setCameraX] = useState(0)
  const [bestDistance, setBestDistance] = useState(0)

  const generateTerrain = useCallback(() => {
    const points: Point[] = []
    let y = 300
    
    for (let x = 0; x < 5000; x += 30) {
      const variation = Math.sin(x * 0.01) * 50 + Math.cos(x * 0.005) * 30
      y = 300 + variation + (Math.random() - 0.5) * 20
      y = Math.max(250, Math.min(350, y))
      points.push({ x, y })
    }
    
    setTerrain(points)
  }, [])

  useEffect(() => {
    generateTerrain()
  }, [generateTerrain])

  const getTerrainY = useCallback((x: number): number => {
    if (terrain.length < 2) return 300
    
    for (let i = 0; i < terrain.length - 1; i++) {
      if (x >= terrain[i].x && x <= terrain[i + 1].x) {
        const t = (x - terrain[i].x) / (terrain[i + 1].x - terrain[i].x)
        return terrain[i].y + (terrain[i + 1].y - terrain[i].y) * t
      }
    }
    return 300
  }, [terrain])

  const getTerrainAngle = useCallback((x: number): number => {
    if (terrain.length < 2) return 0
    
    for (let i = 0; i < terrain.length - 1; i++) {
      if (x >= terrain[i].x && x <= terrain[i + 1].x) {
        const dx = terrain[i + 1].x - terrain[i].x
        const dy = terrain[i + 1].y - terrain[i].y
        return Math.atan2(dy, dx)
      }
    }
    return 0
  }, [terrain])

  const checkCollision = useCallback((carState: Car): boolean => {
    const frontX = carState.x + Math.cos(carState.rotation) * CAR_WIDTH / 2
    const frontY = carState.y + Math.sin(carState.rotation) * CAR_WIDTH / 2
    const backX = carState.x - Math.cos(carState.rotation) * CAR_WIDTH / 2
    const backY = carState.y - Math.sin(carState.rotation) * CAR_WIDTH / 2
    
    const frontTerrainY = getTerrainY(frontX)
    const backTerrainY = getTerrainY(backX)
    
    const frontWheel = frontY + Math.cos(carState.rotation) * CAR_HEIGHT / 2
    const backWheel = backY + Math.cos(carState.rotation) * CAR_HEIGHT / 2
    
    if (frontWheel > frontTerrainY + 5 || backWheel > backTerrainY + 5) {
      return true
    }
    
    if (Math.abs(carState.rotation) > Math.PI / 2) {
      return true
    }
    
    return false
  }, [getTerrainY])

  const updatePhysics = useCallback(() => {
    if (gameOver) return

    setCar((prev) => {
      let newCar = { ...prev }
      
      const enginePower = 0.3
      const brakeForce = 0.2
      
      if (keys.right && fuel > 0) {
        newCar.velocityX += enginePower * Math.cos(newCar.rotation)
        newCar.velocityY += enginePower * Math.sin(newCar.rotation)
        setFuel((f) => Math.max(0, f - 0.1))
      }
      
      if (keys.left) {
        newCar.velocityX *= 0.95
      }
      
      newCar.velocityY += GRAVITY
      
      newCar.x += newCar.velocityX
      newCar.y += newCar.velocityY
      
      const frontX = newCar.x + Math.cos(newCar.rotation) * CAR_WIDTH / 2
      const backX = newCar.x - Math.cos(newCar.rotation) * CAR_WIDTH / 2
      const frontTerrainY = getTerrainY(frontX)
      const backTerrainY = getTerrainY(backX)
      
      const frontWheelY = newCar.y + Math.cos(newCar.rotation) * CAR_HEIGHT / 2
      const backWheelY = newCar.y + Math.cos(newCar.rotation) * CAR_HEIGHT / 2
      
      let onGround = false
      
      if (frontWheelY >= frontTerrainY) {
        const terrainAngle = getTerrainAngle(frontX)
        const penetration = frontWheelY - frontTerrainY
        newCar.y -= penetration * 0.5
        newCar.velocityY *= -0.3
        newCar.velocityX *= 0.98
        onGround = true
      }
      
      if (backWheelY >= backTerrainY) {
        const terrainAngle = getTerrainAngle(backX)
        const penetration = backWheelY - backTerrainY
        newCar.y -= penetration * 0.5
        newCar.velocityY *= -0.3
        newCar.velocityX *= 0.98
        onGround = true
      }
      
      if (onGround) {
        const targetAngle = getTerrainAngle(newCar.x)
        const angleDiff = targetAngle - newCar.rotation
        newCar.rotation += angleDiff * 0.1
        newCar.angularVelocity = angleDiff * 0.05
      } else {
        newCar.angularVelocity += (newCar.velocityX * 0.001)
        newCar.rotation += newCar.angularVelocity
        newCar.angularVelocity *= 0.98
      }
      
      if (checkCollision(newCar)) {
        setGameOver(true)
      }
      
      const newDistance = Math.floor(newCar.x / 10)
      if (newDistance > distance) {
        setDistance(newDistance)
        setScore((s) => s + 1)
        if (newDistance > bestDistance) {
          setBestDistance(newDistance)
        }
      }
      
      setCameraX(newCar.x - 200)
      
      return newCar
    })
  }, [keys, fuel, gameOver, getTerrainY, getTerrainAngle, checkCollision, distance, bestDistance])

  useEffect(() => {
    const interval = setInterval(updatePhysics, 1000 / 60)
    return () => clearInterval(interval)
  }, [updatePhysics])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    ctx.fillStyle = "#87CEEB"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    ctx.save()
    ctx.translate(-cameraX, 0)
    
    ctx.fillStyle = "#8B7355"
    ctx.beginPath()
    ctx.moveTo(terrain[0]?.x || 0, CANVAS_HEIGHT)
    terrain.forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.lineTo(terrain[terrain.length - 1]?.x || 0, CANVAS_HEIGHT)
    ctx.closePath()
    ctx.fill()
    
    ctx.strokeStyle = "#228B22"
    ctx.lineWidth = 3
    ctx.beginPath()
    terrain.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.stroke()
    
    ctx.save()
    ctx.translate(car.x, car.y)
    ctx.rotate(car.rotation)
    
    ctx.fillStyle = "#FF6B6B"
    ctx.fillRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT)
    
    ctx.fillStyle = "#4ECDC4"
    ctx.fillRect(-CAR_WIDTH / 2 + 10, -CAR_HEIGHT / 2 + 5, 20, 15)
    
    ctx.fillStyle = "#333"
    ctx.beginPath()
    ctx.arc(-CAR_WIDTH / 2 + 15, CAR_HEIGHT / 2, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(CAR_WIDTH / 2 - 15, CAR_HEIGHT / 2, 8, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.font = "30px Arial"
    ctx.fillText("🌿", -15, -10)
    
    ctx.restore()
    
    ctx.restore()
  }, [car, terrain, cameraX])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        setKeys((k) => ({ ...k, left: true }))
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setKeys((k) => ({ ...k, right: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        setKeys((k) => ({ ...k, left: false }))
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setKeys((k) => ({ ...k, right: false }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const resetGame = () => {
    setCar({
      x: 100,
      y: 200,
      rotation: 0,
      velocityX: 0,
      velocityY: 0,
      angularVelocity: 0,
    })
    setFuel(100)
    setDistance(0)
    setScore(0)
    setGameOver(false)
    setKeys({ left: false, right: false })
    setCameraX(0)
    generateTerrain()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Distancia</div>
          <div className="text-2xl font-bold">{distance}m</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Puntos</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Récord</div>
          <div className="text-2xl font-bold">{bestDistance}m</div>
        </div>

        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <Card className="p-4 bg-gradient-to-b from-blue-200 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg"
        />
      </Card>

      <div className="flex gap-4 w-full">
        <Card className="flex-1 p-3 bg-orange-100 dark:bg-orange-950">
          <div className="flex items-center gap-2 mb-2">
            <Fuel className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-semibold">Combustible</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-full rounded-full transition-all ${
                fuel > 50 ? "bg-green-500" : fuel > 20 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${fuel}%` }}
            />
          </div>
        </Card>

        <Card className="flex-1 p-3 bg-blue-100 dark:bg-blue-950">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold">Velocidad</span>
          </div>
          <div className="text-2xl font-bold text-center">
            {Math.abs(Math.round(car.velocityX * 10))} km/h
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        <Button
          onMouseDown={() => setKeys((k) => ({ ...k, left: true }))}
          onMouseUp={() => setKeys((k) => ({ ...k, left: false }))}
          onTouchStart={() => setKeys((k) => ({ ...k, left: true }))}
          onTouchEnd={() => setKeys((k) => ({ ...k, left: false }))}
          disabled={gameOver}
          size="lg"
          variant="outline"
          className="h-20 text-lg"
        >
          ⬅️ Frenar
        </Button>
        
        <Button
          onMouseDown={() => setKeys((k) => ({ ...k, right: true }))}
          onMouseUp={() => setKeys((k) => ({ ...k, right: false }))}
          onTouchStart={() => setKeys((k) => ({ ...k, right: true }))}
          onTouchEnd={() => setKeys((k) => ({ ...k, right: false }))}
          disabled={gameOver || fuel <= 0}
          size="lg"
          className="h-20 text-lg"
        >
          ➡️ Acelerar
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>← (o A): Frenar | → (o D): Acelerar</div>
        <div>¡Mantén el equilibrio y llega lo más lejos posible!</div>
      </div>

      {gameOver && (
        <Card className="p-6 text-center bg-destructive/10 border-destructive w-full">
          <h3 className="text-xl font-bold mb-2">¡El carro volcó! 🚗💥</h3>
          <p className="text-muted-foreground mb-2">Distancia recorrida: {distance}m</p>
          <p className="text-muted-foreground mb-4">Puntuación: {score}</p>
          {distance === bestDistance && distance > 0 && (
            <p className="text-green-600 dark:text-green-400 mb-4 font-bold">
              ¡Nuevo récord! 🏆
            </p>
          )}
          <Button onClick={resetGame} className="w-full">
            Intentar de nuevo
          </Button>
        </Card>
      )}

      {fuel <= 0 && !gameOver && (
        <Card className="p-4 text-center bg-yellow-100 dark:bg-yellow-950 border-yellow-500 w-full">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            ⚠️ ¡Sin combustible! El carro se detendrá
          </p>
        </Card>
      )}
    </div>
  )
}