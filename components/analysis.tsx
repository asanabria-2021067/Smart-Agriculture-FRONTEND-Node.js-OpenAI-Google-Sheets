"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Droplets,
  Thermometer,
  Flower2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Target,
  Clock,
  Activity,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Leaf,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { API_CONFIG, getApiUrl } from "@/lib/config";

interface Maceta {
  macetaId: number;
  name: string;
  emoji: string;
  healthScore?: number;
  mood?: string;
  needsWater?: boolean;
  lastUpdate?: string;
}

interface HealthScore {
  overallScore: number;
  status: string;
  components: {
    temperatura: { score: number; status: string };
    humedadSuelo: { score: number; status: string };
    humedadAire?: { score: number; status: string };
  };
  recommendations: Array<{
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    action: string;
    reason: string;
  }>;
}

interface Prediction {
  needed: boolean;
  confidence: number;
  recommendation?: { duration: number; timing: string };
  reasons: string[];
}

export default function Analysis() {
  const [macetas, setMacetas] = useState<Maceta[]>([]);
  const [selectedMaceta, setSelectedMaceta] = useState<string>("all");
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [patterns, setPatterns] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de macetas
  useEffect(() => {
    fetch(getApiUrl(API_CONFIG.endpoints.macetas))
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setMacetas(res.data);
          if (res.data.length > 0) {
            setSelectedMaceta(res.data[0].macetaId.toString());
          }
        }
      });
  }, []);

  const fetchAnalysisForMaceta = async (macetaId: string) => {
    try {
      setLoading(true);
      setError(null);

      const base = macetaId === "all"
        ? API_CONFIG.endpoints
        : {
            analysisHealthScore: `/api/macetas/${macetaId}/analysis/health-score`,
            analysisIrrigationPrediction: `/api/macetas/${macetaId}/analysis/irrigation-prediction`,
            analysisAnomalies: `/api/macetas/${macetaId}/analysis/anomalies`,
            analysisDailyPatterns: `/api/macetas/${macetaId}/analysis/daily-patterns`,
          };

      const endpoints = macetaId === "all" ? API_CONFIG.endpoints : base;

      const [healthRes, predRes, anomaliesRes, patternsRes] = await Promise.all([
        fetch(getApiUrl(endpoints.analysisHealthScore) + "?hours=24"),
        fetch(getApiUrl(endpoints.analysisIrrigationPrediction) + "?hours=6"),
        fetch(getApiUrl(endpoints.analysisAnomalies) + "?hours=24&field=humedadSuelo"),
        fetch(getApiUrl(endpoints.analysisDailyPatterns) + "?hours=48"),
      ]);

      if (healthRes.ok) {
        const json = await healthRes.json();
        if (json.success) setHealth(json);
      }

      if (predRes.ok) {
        const json = await predRes.json();
        if (json.success) setPrediction(json.prediction || json);
      }

      if (anomaliesRes.ok) {
        const json = await anomaliesRes.json();
        if (json.success) setAnomalies(json);
      }

      if (patternsRes.ok) {
        const json = await patternsRes.json();
        if (json.success) setPatterns(json.patterns || json);
      }
    } catch (err) {
      setError("Error al cargar análisis de esta maceta");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMaceta) {
      fetchAnalysisForMaceta(selectedMaceta);
    }
  }, [selectedMaceta]);

  const currentMaceta = macetas.find(m => m.macetaId.toString() === selectedMaceta);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      EXCELENTE: "bg-emerald-500 text-white",
      BUENO: "bg-blue-500 text-white",
      REGULAR: "bg-yellow-500 text-white",
      MALO: "bg-orange-500 text-white",
      CRÍTICO: "bg-red-600 text-white",
    };
    return map[status] || "bg-gray-500 text-white";
  };

  if (loading && !health) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Leaf className="w-20 h-20 text-emerald-600 animate-pulse mx-auto" />
          <p className="text-2xl font-bold text-gray-700">Cargando análisis de {currentMaceta?.name || "tu planta"}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Fondo vivo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 px-4 py-8 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con selector de maceta */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-black text-gray-800 flex items-center gap-4 justify-center md:justify-start">
                <Brain className="w-14 h-14 text-emerald-600" />
                Análisis por Maceta
              </h1>
              <p className="text-xl text-gray-600 mt-3">Todo sobre tu planta favorita</p>
            </div>

            <div className="flex items-center gap-4">
              <Select value={selectedMaceta} onValueChange={setSelectedMaceta}>
                <SelectTrigger className="w-64 bg-white/90 backdrop-blur-xl shadow-xl text-lg">
                  <SelectValue placeholder="Selecciona una maceta" />
                </SelectTrigger>
                <SelectContent>
                  {macetas.map((maceta) => (
                    <SelectItem key={maceta.macetaId} value={maceta.macetaId.toString()}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{maceta.emoji}</span>
                        <div>
                          <p className="font-semibold">{maceta.name}</p>
                          <p className="text-xs text-muted-foreground">Maceta {maceta.macetaId}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => fetchAnalysisForMaceta(selectedMaceta)}
                size="lg"
                className="bg-white/90 backdrop-blur-xl shadow-2xl hover:scale-105"
              >
                <RefreshCw className={cn("w-6 h-6", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Maceta seleccionada - Hero Card */}
          {currentMaceta && (
            <Card className="p-8 mb-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-9xl">{currentMaceta.emoji}</div>
                  <div>
                    <h2 className="text-5xl font-black">{currentMaceta.name}</h2>
                    <p className="text-2xl opacity-90">Maceta {currentMaceta.macetaId}</p>
                    {currentMaceta.mood && (
                      <p className="text-xl mt-2 opacity-80">Ánimo: {currentMaceta.mood}</p>
                    )}
                  </div>
                </div>
                {currentMaceta.needsWater && (
                  <Badge className="text-2xl px-8 py-4 bg-red-600">
                    Necesita Agua
                  </Badge>
                )}
              </div>
            </Card>
          )}

          {/* Salud General */}
          {health && (
            <Card className="p-10 mb-10 bg-white/90 backdrop-blur-2xl shadow-3xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-2xl">
                    <Target className="w-16 h-16 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gray-800">Salud de {currentMaceta?.name}</h2>
                    <p className="text-xl text-gray-600">Análisis completo de bienestar</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-8xl font-black text-gray-800">{health.overallScore}</div>
                  <Badge className={cn("text-2xl px-8 py-3 mt-3", getStatusColor(health.status))}>
                    {health.status}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(health.components).map(([key, value]) => (
                  <Card key={key} className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      {key === "temperatura" && <Thermometer className="w-10 h-10 text-orange-500" />}
                      {key === "humedadSuelo" && <Droplets className="w-10 h-10 text-blue-500" />}
                      {key.includes("humedadAire") && <Activity className="w-10 h-10 text-cyan-500" />}
                      <span className="text-4xl font-black">{value.score}</span>
                    </div>
                    <p className="text-lg font-bold capitalize">
                      {key === "humedadSuelo" ? "Humedad Suelo" : key === "humedadAire" ? "Humedad Aire" : "Temperatura"}
                    </p>
                    <Badge className={cn("mt-2", getStatusColor(value.status))}>{value.status}</Badge>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Predicción de Riego */}
          {prediction && (
            <Card className="p-10 mb-10 bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-3xl">
              <div className="text-center">
                <Droplets className="w-24 h-24 mx-auto mb-6 opacity-90" />
                <h2 className="text-5xl font-black mb-4">
                  {prediction.needed ? "¡Necesita Riego!" : "Está Bien Hidratada"}
                </h2>
                <Badge className="text-3xl px-10 py-4 bg-white/20">
                  Confianza: {prediction.confidence}%
                </Badge>

                {prediction.recommendation && (
                  <div className="mt-8 bg-white/10 backdrop-blur rounded-3xl p-8 inline-block">
                    <Clock className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-3xl font-bold">Riego Recomendado</p>
                    <p className="text-7xl font-black mt-4">{prediction.recommendation.duration}s</p>
                    <p className="text-2xl mt-4 opacity-90">{prediction.recommendation.timing}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Tabs: Anomalías, Patrones, Insights */}
          <Tabs defaultValue="anomalies" className="mt-10">
            <TabsList className="grid w-full grid-cols-3 h-16 text-lg font-bold bg-white/80 backdrop-blur-xl shadow-2xl">
              <TabsTrigger value="anomalies">Anomalías</TabsTrigger>
              <TabsTrigger value="patterns">Patrones</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="anomalies" className="mt-6">
              <Card className="p-10 bg-white/90 backdrop-blur-xl shadow-3xl text-center">
                {anomalies?.anomaliesFound === 0 ? (
                  <div className="py-20">
                    <CheckCircle2 className="w-24 h-24 text-emerald-600 mx-auto mb-6" />
                    <p className="text-3xl font-bold text-gray-700">¡Todo perfecto!</p>
                    <p className="text-xl text-gray-600 mt-3">No hay anomalías en {currentMaceta?.name}</p>
                  </div>
                ) : (
                  <div className="text-4xl font-black text-orange-600">
                    {anomalies?.anomaliesFound} anomalías detectadas
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="mt-6">
              <Card className="p-10 bg-white/90 backdrop-blur-xl shadow-3xl">
                <h3 className="text-3xl font-black mb-8 text-center">Patrones Diarios de {currentMaceta?.name}</h3>
                <div className="text-center py-16">
                  <BarChart3 className="w-20 h-20 text-purple-600 mx-auto mb-6" />
                  <p className="text-2xl text-gray-600">Análisis horario en desarrollo...</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <Card className="p-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center shadow-3xl">
                <Sparkles className="w-32 h-32 mx-auto mb-8 opacity-80" />
                <h3 className="text-5xl font-black mb-6">{currentMaceta?.name} está {health?.status.toLowerCase()}</h3>
                <p className="text-3xl leading-relaxed">
                  {currentMaceta?.name} te agradece tus cuidados
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}