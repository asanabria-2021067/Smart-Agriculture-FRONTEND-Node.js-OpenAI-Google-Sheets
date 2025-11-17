"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Droplets, Thermometer, Wind, RefreshCw, Brain, Target, AlertCircle, CheckCircle2, Clock, BarChart3 } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { API_CONFIG, getApiUrl } from "@/lib/config"

interface HealthScore {
  overallScore: number
  status: string
  components: {
    temperatura: { score: number; status: string }
    humedad: { score: number; status: string }
  }
  recommendations: Array<{
    priority: string
    action: string
    reason: string
  }>
}

interface IrrigationPrediction {
  needed: boolean
  confidence: number
  recommendation?: {
    duration: number
    timing: string
  }
  reasoning: string[]
}

interface Anomaly {
  timestamp: string
  value: number
  expectedRange: { min: number; max: number }
  deviation: number
}

interface CompleteAnalysis {
  temperatura: any
  humedadSuelo: any
  humedadAire: any
}

export default function Analysis() {
  const [loading, setLoading] = useState(true)
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null)
  const [prediction, setPrediction] = useState<IrrigationPrediction | null>(null)
  const [anomalies, setAnomalies] = useState<any>(null)
  const [completeAnalysis, setCompleteAnalysis] = useState<CompleteAnalysis | null>(null)
  const [dailyPatterns, setDailyPatterns] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAllAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [health, pred, anom, complete, patterns] = await Promise.all([
        fetch(getApiUrl(`${API_CONFIG.endpoints.analysisHealthScore}?hours=24`)).then((r) => {
          if (!r.ok) throw new Error(`Error en health score: ${r.status}`)
          return r.json()
        }),
        fetch(getApiUrl(`${API_CONFIG.endpoints.analysisIrrigationPrediction}?hours=6`)).then((r) => {
          if (!r.ok) throw new Error(`Error en predicción: ${r.status}`)
          return r.json()
        }),
        fetch(getApiUrl(`${API_CONFIG.endpoints.analysisAnomalies}?hours=24&field=humedadSuelo`)).then((r) => {
          if (!r.ok) throw new Error(`Error en anomalías: ${r.status}`)
          return r.json()
        }),
        fetch(getApiUrl(`${API_CONFIG.endpoints.analysisComplete}?hours=24`)).then((r) => {
          if (!r.ok) throw new Error(`Error en análisis completo: ${r.status}`)
          return r.json()
        }),
        fetch(getApiUrl(`${API_CONFIG.endpoints.analysisDailyPatterns}?hours=48`)).then((r) => {
          if (!r.ok) throw new Error(`Error en patrones: ${r.status}`)
          return r.json()
        }),
      ])

      setHealthScore(health)
      setPrediction(pred.prediction)
      setAnomalies(anom)
      setCompleteAnalysis(complete.analysis)
      setDailyPatterns(patterns.patterns)
    } catch (error) {
      console.error("Error fetching analysis:", error)
      setError(error instanceof Error ? error.message : "Error de conexión con el backend")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllAnalysis()
    const interval = setInterval(fetchAllAnalysis, 30000)
    return () => clearInterval(interval)
  }, [])

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "CRECIENTE":
        return <TrendingUp className="w-4 h-4 text-chart-1" />
      case "DECRECIENTE":
        return <TrendingDown className="w-4 h-4 text-chart-2" />
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      EXCELENTE: "text-green-600 bg-green-100 dark:bg-green-950",
      BUENO: "text-blue-600 bg-blue-100 dark:bg-blue-950",
      REGULAR: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950",
      MALO: "text-orange-600 bg-orange-100 dark:bg-orange-950",
      CRÍTICO: "text-red-600 bg-red-100 dark:bg-red-950",
    }
    return statusMap[status] || "text-muted-foreground bg-muted"
  }

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      CRITICAL: "text-red-600 bg-red-100 dark:bg-red-950",
      HIGH: "text-orange-600 bg-orange-100 dark:bg-orange-950",
      MEDIUM: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950",
      LOW: "text-blue-600 bg-blue-100 dark:bg-blue-950",
    }
    return priorityMap[priority] || "text-muted-foreground bg-muted"
  }

  if (error && !healthScore && !prediction && !completeAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Error al Cargar Análisis</h3>
            <p className="text-sm text-muted-foreground mb-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Verifica que el backend esté corriendo en:
            </p>
            <code className="block mt-2 text-xs bg-muted p-2 rounded">
              http://localhost:3000
            </code>
          </div>
          <Button onClick={fetchAllAnalysis} className="w-full" disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            {loading ? "Conectando..." : "Reintentar"}
          </Button>
        </Card>
      </div>
    )
  }

  if (loading && !healthScore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Analizando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">Análisis Avanzado</h1>
            <p className="text-muted-foreground">Estadísticas detalladas y predicciones inteligentes</p>
          </div>
          <Button
            onClick={fetchAllAnalysis}
            variant="outline"
            size="icon"
            className="hover:scale-110 transition-transform bg-transparent"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </Button>
        </div>

        {error && (healthScore || prediction || completeAnalysis) && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium">Problema al actualizar datos</p>
                <p className="text-xs text-muted-foreground">Mostrando análisis anterior. {error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Health Score Card */}
        {healthScore && (
          <Card className="p-6 bg-gradient-to-br from-card to-accent/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-balance">Estado de Salud General</h2>
                  <p className="text-sm text-muted-foreground">Score calculado de múltiples factores</p>
                </div>
              </div>
              <Badge className={cn("text-lg px-4 py-2", getStatusColor(healthScore.status))}>
                {healthScore.status}
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score General</span>
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-bold text-balance">{healthScore.overallScore}/100</div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-chart-1/10 to-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Temperatura</span>
                  <Thermometer className="w-4 h-4 text-chart-1" />
                </div>
                <div className="text-3xl font-bold text-balance">{healthScore.components.temperatura.score}/100</div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {healthScore.components.temperatura.status}
                </Badge>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-chart-2/10 to-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Humedad</span>
                  <Droplets className="w-4 h-4 text-chart-2" />
                </div>
                <div className="text-3xl font-bold text-balance">{healthScore.components.humedad.score}/100</div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {healthScore.components.humedad.status}
                </Badge>
              </Card>
            </div>

            {/* Recommendations */}
            {healthScore.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  Recomendaciones
                </h3>
                {healthScore.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                    <Badge className={cn("shrink-0 mt-0.5", getPriorityColor(rec.priority))}>{rec.priority}</Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rec.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Irrigation Prediction */}
        {prediction && (
          <Card className="p-6 bg-gradient-to-br from-card to-chart-2/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-chart-2/20">
                <Droplets className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-balance">Predicción de Riego</h2>
                <p className="text-sm text-muted-foreground">Basado en análisis de los últimos datos</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Card className="p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">¿Se necesita riego?</span>
                  {prediction.needed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="text-2xl font-bold">{prediction.needed ? "Sí" : "No"}</div>
                <Badge variant="outline" className="mt-2">
                  Confianza: {prediction.confidence}%
                </Badge>
              </Card>

              {prediction.recommendation && (
                <Card className="p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Duración Recomendada</span>
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{prediction.recommendation.duration}s</div>
                  <Badge variant="outline" className="mt-2">
                    {prediction.recommendation.timing}
                  </Badge>
                </Card>
              )}
            </div>

            {prediction.reasoning && prediction.reasoning.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Razonamiento:</h3>
                {prediction.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tabs for detailed analysis */}
        <Tabs defaultValue="complete" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="complete">Análisis Completo</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalías</TabsTrigger>
            <TabsTrigger value="patterns">Patrones Diarios</TabsTrigger>
          </TabsList>

          <TabsContent value="complete" className="space-y-4">
            {completeAnalysis && (
              <div className="grid md:grid-cols-3 gap-4">
                {/* Temperature Analysis */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-5 h-5 text-chart-1" />
                    <h3 className="font-semibold">Temperatura</h3>
                  </div>
                  {completeAnalysis.temperatura && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Promedio:</span>
                        <span className="font-medium">{completeAnalysis.temperatura.stats?.mean?.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mín/Máx:</span>
                        <span className="font-medium">
                          {completeAnalysis.temperatura.stats?.min?.toFixed(1)}° /{" "}
                          {completeAnalysis.temperatura.stats?.max?.toFixed(1)}°
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tendencia:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(completeAnalysis.temperatura.trend?.direction)}
                          <span className="font-medium">{completeAnalysis.temperatura.trend?.direction}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-full justify-center mt-2">
                        {completeAnalysis.temperatura.health?.status}
                      </Badge>
                    </div>
                  )}
                </Card>

                {/* Soil Humidity Analysis */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-chart-2" />
                    <h3 className="font-semibold">Humedad Suelo</h3>
                  </div>
                  {completeAnalysis.humedadSuelo && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Promedio:</span>
                        <span className="font-medium">{completeAnalysis.humedadSuelo.stats?.mean?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mín/Máx:</span>
                        <span className="font-medium">
                          {completeAnalysis.humedadSuelo.stats?.min?.toFixed(1)}% /{" "}
                          {completeAnalysis.humedadSuelo.stats?.max?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tendencia:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(completeAnalysis.humedadSuelo.trend?.direction)}
                          <span className="font-medium">{completeAnalysis.humedadSuelo.trend?.direction}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-full justify-center mt-2">
                        {completeAnalysis.humedadSuelo.health?.status}
                      </Badge>
                    </div>
                  )}
                </Card>

                {/* Air Humidity Analysis */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wind className="w-5 h-5 text-chart-3" />
                    <h3 className="font-semibold">Humedad Aire</h3>
                  </div>
                  {completeAnalysis.humedadAire && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Promedio:</span>
                        <span className="font-medium">{completeAnalysis.humedadAire.stats?.mean?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mín/Máx:</span>
                        <span className="font-medium">
                          {completeAnalysis.humedadAire.stats?.min?.toFixed(1)}% /{" "}
                          {completeAnalysis.humedadAire.stats?.max?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tendencia:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(completeAnalysis.humedadAire.trend?.direction)}
                          <span className="font-medium">{completeAnalysis.humedadAire.trend?.direction}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-full justify-center mt-2">
                        {completeAnalysis.humedadAire.health?.status}
                      </Badge>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            {anomalies && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Anomalías Detectadas</h3>
                    <p className="text-sm text-muted-foreground">Total encontradas: {anomalies.anomaliesFound || 0}</p>
                  </div>
                </div>

                {anomalies.anomaliesFound === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-muted-foreground">No se detectaron anomalías en el período analizado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anomalies.anomalies &&
                      anomalies.anomalies.map((anomaly: Anomaly, idx: number) => (
                        <div key={idx} className="p-4 bg-orange-100 dark:bg-orange-950 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">Valor anómalo detectado</p>
                              <p className="text-sm text-muted-foreground mt-1">{anomaly.timestamp}</p>
                            </div>
                            <Badge variant="destructive">{anomaly.value}</Badge>
                          </div>
                          {anomaly.expectedRange && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Rango esperado: {anomaly.expectedRange.min.toFixed(1)} -{" "}
                              {anomaly.expectedRange.max.toFixed(1)}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            {dailyPatterns && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Patrones Diarios</h3>
                    <p className="text-sm text-muted-foreground">Análisis de comportamiento por hora</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {dailyPatterns.hourlyAverages && (
                    <div>
                      <h4 className="font-medium mb-3">Promedios por Hora</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(dailyPatterns.hourlyAverages).map(([hour, data]: [string, any]) => (
                          <Card key={hour} className="p-3 bg-accent/50">
                            <div className="text-sm font-medium mb-1">{hour}:00h</div>
                            <div className="text-xs space-y-1 text-muted-foreground">
                              <div>T: {data.temperatura?.toFixed(1)}°C</div>
                              <div>HS: {data.humedadSuelo?.toFixed(1)}%</div>
                              <div>HA: {data.humedadAire?.toFixed(1)}%</div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailyPatterns.peakHours && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4 bg-chart-1/10">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-chart-1" />
                          Hora Más Caliente
                        </h4>
                        <div className="text-2xl font-bold">{dailyPatterns.peakHours.hottest}:00h</div>
                      </Card>
                      <Card className="p-4 bg-chart-2/10">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-chart-2" />
                          Hora Más Fresca
                        </h4>
                        <div className="text-2xl font-bold">{dailyPatterns.peakHours.coolest}:00h</div>
                      </Card>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
