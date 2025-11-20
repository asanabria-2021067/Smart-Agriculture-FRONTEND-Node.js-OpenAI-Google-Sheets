"use client"

import { useState, useEffect } from "react"
import {
  RefreshCw,
  Thermometer,
  Droplets,
  Cloud,
  Sun,
  Zap,
  Activity,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { cn } from "@/lib/utils"
import { API_CONFIG, getApiUrl } from "@/lib/config"

interface SensorData {
  temperatura: number
  humedadSuelo: number
  humedadAire: number
  luz: boolean
  timestamp: string
}

interface Stats {
  totalRiegos: number
  consumoAguaLitros: number
  consumoEnergiaKWh: number
}

export default function Dashboard() {
  const [current, setCurrent] = useState<SensorData | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>({
    totalRiegos: 0,
    consumoAguaLitros: 0,
    consumoEnergiaKWh: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [currentRes, historyRes] = await Promise.all([
        fetch(getApiUrl(API_CONFIG.endpoints.sensorsCurrent)),
        fetch(getApiUrl(API_CONFIG.endpoints.sensorsHistory) + "?hours=48"),
      ])

      // Current Data
      if (currentRes.ok) {
        const json = await currentRes.json()
        if (json.success && json.data) {
          setCurrent({
            temperatura: json.data.temperatura,
            humedadSuelo: json.data.humedadSuelo,
            humedadAire: json.data.humedadAire,
            luz: json.data.luz,
            timestamp: json.data.timestamp || new Date().toISOString(),
          })
        }
      }

      // History + Cálculo de riegos
      if (historyRes.ok) {
        const json = await historyRes.json()
        if (json.success && json.data) {
          const data = json.data
          setHistory(data)

          const riegos = data.filter((d: any) => d.tiempoRiego > 0)
          const aguaTotal = riegos.reduce((sum: number, r: any) => sum + (r.consumoAgua || 0), 0)
          const energiaTotal = riegos.reduce((sum: number, r: any) => sum + (r.consumoEnergia || 0), 0)

          // Actualizamos stats SIN sobrescribir con null
          setStats({
            totalRiegos: riegos.length,
            consumoAguaLitros: Number(aguaTotal.toFixed(2)),
            consumoEnergiaKWh: Number(energiaTotal.toFixed(4)),
          })
        }
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 8000)
    return () => clearInterval(interval)
  }, [])

  const chartData = history.slice(-40).map((item: any) => ({
    hora: new Date(item.timestamp || item.fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temp: Number(item.temperatura.toFixed(1)),
    suelo: Number(item.humedadSuelo.toFixed(0)),
  }))

  const miniChartData = history.slice(-12).map((item: any) => ({
    value: Number(item.temperatura.toFixed(1)),
  }))

  const miniChartDataSuelo = history.slice(-12).map((item: any) => ({
    value: Number(item.humedadSuelo.toFixed(0)),
  }))

  const miniChartDataAire = history.slice(-12).map((item: any) => ({
    value: Number(item.humedadAire.toFixed(0)),
  }))

  if (loading && !current) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-lg font-medium text-slate-700">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Hola, Bienvenido de vuelta</h1>
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button
              onClick={fetchAllData}
              size="lg"
              variant="outline"
              className="border-slate-300 hover:bg-slate-50 bg-transparent"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Temperatura - color azul pastel */}
          <Card className="relative p-6 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-4 right-4 w-32 h-32 bg-blue-200 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                  <Thermometer className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-2">Temperatura</p>
              <p className="text-4xl font-bold text-slate-900 mb-3">{current?.temperatura.toFixed(1) || "--"}°C</p>
              {/* Mini gráfico de línea */}
              <div className="h-12 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniChartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Humedad Aire - color amarillo/naranja pastel */}
          <Card className="relative p-6 border-0 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-4 right-4 w-32 h-32 bg-amber-200 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-slate-600 mb-2">Humedad Aire</p>
              <p className="text-4xl font-bold text-slate-900 mb-3">{current?.humedadAire.toFixed(0) || "--"}%</p>
              <div className="h-12 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniChartDataAire}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Riegos - color coral/rosa pastel */}
          <Card className="relative p-6 border-0 bg-gradient-to-br from-rose-50 to-rose-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-4 right-4 w-32 h-32 bg-rose-200 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-2xl bg-rose-500/10">
                  <Sparkles className="w-7 h-7 text-rose-600" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600">

                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-2">Riegos totales</p>
              <p className="text-4xl font-bold text-slate-900 mb-3">{stats.totalRiegos}</p>
              <div className="h-12 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history.slice(-12).map((item: any) => ({
                      value: item.tiempoRiego > 0 ? 1 : 0,
                    }))}
                  >
                    <Line
                      type="stepAfter"
                      dataKey="value"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          <Card className="p-6 bg-white border-slate-200">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Temperatura ambiente</h3>
              <p className="text-sm text-slate-500">Últimas 48 horas</p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="hora" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  name="Temperatura (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Consumo de agua</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.consumoAguaLitros}
                  <span className="text-base ml-1 font-medium text-slate-600">litros</span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Energía consumida</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.consumoEnergiaKWh}
                  <span className="text-base ml-1 font-medium text-slate-600">kWh</span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50">
                <Sun className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Estado de luz</p>
                <p className="text-2xl font-bold text-slate-900">{current?.luz ? "Detectada" : "No detectada"}</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
