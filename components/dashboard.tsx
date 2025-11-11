"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { RefreshCw, Thermometer, Droplets, Cloud, Sun, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import PlantScene from "@/components/plant-scene"
import { API_CONFIG, getApiUrl } from "@/lib/config"

interface SensorData {
  temperature: number
  soilHumidity: number
  airHumidity: number
  light: boolean
  timestamp: string
}

export default function Dashboard() {
  const [currentData, setCurrentData] = useState<SensorData | null>(null)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [current, history, statsData] = await Promise.all([
        fetch(getApiUrl(API_CONFIG.endpoints.sensorsCurrent)).then((r) => {
          if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
          return r.json()
        }),
        fetch(getApiUrl(`${API_CONFIG.endpoints.sensorsHistory}?hours=24`)).then((r) => {
          if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
          return r.json()
        }),
        fetch(getApiUrl(`${API_CONFIG.endpoints.sensorsStats}?hours=24`)).then((r) => {
          if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
          return r.json()
        }),
      ])

      setCurrentData(current.data)
      setHistoryData(history.data || [])
      setStats(statsData.data)
    } catch (error) {
      console.error("Error fetching sensor data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const chartData = historyData.map((item) => ({
    time: formatTime(item.timestamp),
    temperature: item.temperature,
    humidity: item.soilHumidity,
  }))

  return (
    <div className="min-h-screen">
      <div className="relative h-[300px] md:h-[400px] bg-gradient-to-b from-accent via-accent/50 to-background overflow-hidden">
        {/* Decorative background circles */}
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
            <div className="text-3xl font-bold text-balance">{currentData?.temperature || "--"}°C</div>
            <div className="text-xs text-muted-foreground mt-2">Ambiente</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-2/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-2/20 ring-2 ring-chart-2/20">
                <Droplets className="w-6 h-6 text-chart-2" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">H. Suelo</span>
            </div>
            <div className="text-3xl font-bold text-balance">{currentData?.soilHumidity || "--"}%</div>
            <div className="text-xs text-muted-foreground mt-2">Hidratación</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-3/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-3/20 ring-2 ring-chart-3/20">
                <Cloud className="w-6 h-6 text-chart-3" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">H. Aire</span>
            </div>
            <div className="text-3xl font-bold text-balance">{currentData?.airHumidity || "--"}%</div>
            <div className="text-xs text-muted-foreground mt-2">Atmosférica</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-5/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-5/20 ring-2 ring-chart-5/20">
                <Sun className="w-6 h-6 text-chart-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Luz Solar</span>
            </div>
            <div className="text-3xl font-bold text-balance">{currentData?.light ? "Sí" : "No"}</div>
            <div className="text-xs text-muted-foreground mt-2">Disponible</div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-balance">Temperatura (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ fill: "var(--chart-1)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-balance">Humedad del Suelo (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  dot={{ fill: "var(--chart-2)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-chart-2/20 via-card to-card hover:shadow-xl transition-all">
            <Droplets className="w-8 h-8 text-chart-2 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Consumo de Agua</p>
            <p className="text-3xl font-bold">{stats?.waterConsumption || 0} L</p>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24h</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-chart-3/20 via-card to-card hover:shadow-xl transition-all">
            <Sun className="w-8 h-8 text-chart-3 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Tiempo de Riego</p>
            <p className="text-3xl font-bold">{stats?.irrigationTime || 0} min</p>
            <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/20 via-card to-card hover:shadow-xl transition-all">
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Número de Riegos</p>
            <p className="text-3xl font-bold">{stats?.irrigationCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24h</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
