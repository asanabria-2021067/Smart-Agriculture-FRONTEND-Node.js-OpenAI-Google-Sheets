"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { RefreshCw, Thermometer, Droplets, Cloud, Sun, Sparkles, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import PlantScene from "@/components/plant-scene"
import { API_CONFIG, getApiUrl } from "@/lib/config"

interface SensorData {
  fecha: string
  timestamp: string
  temperatura: number
  humedadSuelo: number
  humedadAire: number
  luz: boolean
  tiempoRiego: number
  consumoAgua: number
  consumoEnergia: number
}

interface Stats {
  count: number
  temperatura: {
    promedio: number
    min: number
    max: number
  }
  humedadSuelo: {
    promedio: number
    min: number
    max: number
    tendencia: string
  }
  humedadAire: {
    promedio: number
    min: number
    max: number
  }
  totalRiegos: number
  consumoTotal: {
    agua: string
    energia: string
  }
  ultimoRiego: string
}

export default function Dashboard() {
  const [currentData, setCurrentData] = useState<SensorData | null>(null)
  const [historyData, setHistoryData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentResponse = await fetch(getApiUrl(API_CONFIG.endpoints.sensorsCurrent))
      if (!currentResponse.ok) throw new Error(`Error en /current: ${currentResponse.status}`)
      const currentJson = await currentResponse.json()
      if (currentJson.success && currentJson.data) setCurrentData(currentJson.data)

      const historyResponse = await fetch(getApiUrl(`${API_CONFIG.endpoints.sensorsHistory}?hours=24`))
      if (!historyResponse.ok) throw new Error(`Error en /history: ${historyResponse.status}`)
      const historyJson = await historyResponse.json()
      if (historyJson.success && historyJson.data) setHistoryData(historyJson.data)

      const statsResponse = await fetch(getApiUrl(`${API_CONFIG.endpoints.sensorsStats}?hours=24`))
      if (!statsResponse.ok) throw new Error(`Error en /stats: ${statsResponse.status}`)
      const statsJson = await statsResponse.json()

      if (statsJson.success && statsJson.data) {
        const statsData = statsJson.data
        setStats(prev => ({
          count: statsData.humedadSuelo?.stats?.count || prev?.count || 0,
          temperatura: {
            promedio: statsData.temperatura?.stats?.mean || prev?.temperatura.promedio || 0,
            min: statsData.temperatura?.stats?.min || prev?.temperatura.min || 0,
            max: statsData.temperatura?.stats?.max || prev?.temperatura.max || 0,
          },
          humedadSuelo: {
            promedio: statsData.humedadSuelo?.stats?.mean || prev?.humedadSuelo.promedio || 0,
            min: statsData.humedadSuelo?.stats?.min || prev?.humedadSuelo.min || 0,
            max: statsData.humedadSuelo?.stats?.max || prev?.humedadSuelo.max || 0,
            tendencia: statsData.humedadSuelo?.trend?.direction || prev?.humedadSuelo.tendencia || "ESTABLE",
          },
          humedadAire: {
            promedio: statsData.humedadAire?.stats?.mean || prev?.humedadAire.promedio || 0,
            min: statsData.humedadAire?.stats?.min || prev?.humedadAire.min || 0,
            max: statsData.humedadAire?.stats?.max || prev?.humedadAire.max || 0,
          },
          totalRiegos: prev?.totalRiegos || 0,
          consumoTotal: {
            agua: prev?.consumoTotal.agua || "0",
            energia: prev?.consumoTotal.energia || "0",
          },
          ultimoRiego: prev?.ultimoRiego || "N/A",
        }))
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (historyData.length > 0) {
      const riegos = historyData.filter(d => d.tiempoRiego > 0)
      const totalAgua = riegos.reduce((sum, r) => sum + r.consumoAgua, 0)
      const totalEnergia = riegos.reduce((sum, r) => sum + r.consumoEnergia, 0)
      const ultimoRiego = riegos.length > 0 ? riegos[riegos.length - 1].fecha : "N/A"

      setStats(prev => prev ? {
        ...prev,
        totalRiegos: riegos.length,
        consumoTotal: {
          agua: totalAgua.toFixed(2),
          energia: totalEnergia.toFixed(4),
        },
        ultimoRiego,
      } : null)
    }
  }, [historyData])

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return timestamp
    }
  }

  const chartData = historyData.slice(-50).map(item => ({
    time: formatTime(item.timestamp || item.fecha),
    temperatura: Number(item.temperatura.toFixed(1)),
    humedad: Number(item.humedadSuelo.toFixed(1)),
  }))

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case "CRECIENTE": return "↑"
      case "DECRECIENTE": return "↓"
      default: return "→"
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <Activity className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold">Error de Conexión</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">Verifica que el backend esté corriendo en http://localhost:3000</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-[300px] md:h-[400px] bg-gradient-to-b from-accent via-accent/50 to-background overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-40 h-40 bg-chart-2/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-chart-3/5 rounded-full blur-3xl" />
        <PlantScene />
        <div className="absolute top-0 left-0 right-0 p-6 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="backdrop-blur-sm bg-card/30 p-4 rounded-2xl border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold text-balance">Sistema de Riego</h1>
              </div>
              <p className="text-muted-foreground text-sm">Monitoreo en tiempo real</p>
            </div>
            <Button
              onClick={fetchData}
              variant="outline"
              size="icon"
              className="bg-card/80 backdrop-blur-xl border-2 hover:scale-110 transition-transform"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-1/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-1/20 ring-2 ring-chart-1/20">
                <Thermometer className="w-6 h-6 text-chart-1" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Temperatura</span>
            </div>
            <div className="text-3xl font-bold text-balance">
              {currentData?.temperatura.toFixed(1) || "--"}°C
            </div>
            {stats && <div className="text-xs text-muted-foreground mt-2">Promedio: {stats.temperatura.promedio.toFixed(1)}°C</div>}
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-2/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-2/20 ring-2 ring-chart-2/20">
                <Droplets className="w-6 h-6 text-chart-2" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">H. Suelo</span>
            </div>
            <div className="text-3xl font-bold text-balance">
              {currentData?.humedadSuelo.toFixed(1) || "--"}%
            </div>
            {stats && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                Tendencia: {getTrendIcon(stats.humedadSuelo.tendencia)} {stats.humedadSuelo.tendencia}
              </div>
            )}
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-3/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-3/20 ring-2 ring-chart-3/20">
                <Cloud className="w-6 h-6 text-chart-3" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">H. Aire</span>
            </div>
            <div className="text-3xl font-bold text-balance">
              {currentData?.humedadAire.toFixed(1) || "--"}%
            </div>
            {stats && <div className="text-xs text-muted-foreground mt-2">Promedio: {stats.humedadAire.promedio.toFixed(1)}%</div>}
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-5/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-5/20 ring-2 ring-chart-5/20">
                <Sun className="w-6 h-6 text-chart-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Luz Solar</span>
            </div>
            <div className="text-3xl font-bold text-balance">{currentData?.luz ? "Sí" : "No"}</div>
            <div className="text-xs text-muted-foreground mt-2">{currentData?.luz ? "Disponible" : "No detectada"}</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-balance">Temperatura (últimos datos)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} interval="preserveStartEnd" />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="temperatura" stroke="var(--chart-1)" strokeWidth={3} dot={{ fill: "var(--chart-1)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No hay datos disponibles</div>
            )}
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-balance">Humedad del Suelo (últimos datos)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} interval="preserveStartEnd" />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="humedad" stroke="var(--chart-2)" strokeWidth={3} dot={{ fill: "var(--chart-2)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No hay datos disponibles</div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-chart-2/20 via-card to-card hover:shadow-xl transition-all">
            <Droplets className="w-8 h-8 text-chart-2 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Consumo de Agua</p>
            <p className="text-3xl font-bold">{stats?.consumoTotal.agua || "0"} L</p>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24h</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-chart-3/20 via-card to-card hover:shadow-xl transition-all">
            <Sun className="w-8 h-8 text-chart-3 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Consumo de Energía</p>
            <p className="text-3xl font-bold">{stats?.consumoTotal.energia || "0"} Wh</p>
            <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/20 via-card to-card hover:shadow-xl transition-all">
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Número de Riegos</p>
            <p className="text-3xl font-bold">{stats?.totalRiegos || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.ultimoRiego !== "N/A" ? `Último: ${stats?.ultimoRiego}` : "Sin riegos"}
            </p>
          </Card>
        </div>

        {currentData && (
          <Card className="p-4 bg-accent/50">
            <p className="text-sm text-center text-muted-foreground">
              Última actualización: {currentData.fecha} | {historyData.length > 0 && ` ${historyData.length} registros en memoria`}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
