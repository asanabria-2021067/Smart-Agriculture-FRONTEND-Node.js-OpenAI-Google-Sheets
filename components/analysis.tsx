"use client";

import { useState, useEffect } from "react";
import {
  Brain, Droplets, Thermometer, Flower2, AlertTriangle,
  TrendingUp, TrendingDown, Minus, RefreshCw, Target,
  Clock, Activity, Sparkles, AlertCircle, CheckCircle2,
  BarChart3, Leaf, Sun, CloudRain, Wind, Zap
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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

interface HealthData {
  success: boolean;
  macetaId: number;
  overallScore: number;
  status: string;
  components: any;
  recommendations: any[];
  period: { hours: number; dataPoints: number };
}

interface PredictionData {
  success: boolean;
  prediction: {
    needed: boolean;
    confidence: number;
    recommendation?: { duration: number };
    reasons: string[];
  };
}

interface AnomaliesData {
  success: boolean;
  anomaliesFound: number;
  anomalies: any[];
}

interface PatternsData {
  success: boolean;
  available: boolean;
  patterns?: any;
  insights?: any;
}

export default function Analysis() {
  const [macetas, setMacetas] = useState<Maceta[]>([]);
  const [selectedMaceta, setSelectedMaceta] = useState<string>("");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomaliesData | null>(null);
  const [patterns, setPatterns] = useState<PatternsData | null>(null);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl(API_CONFIG.endpoints.macetas))
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data?.length > 0) {
          setMacetas(res.data);
          setSelectedMaceta(res.data[0].macetaId.toString());
        }
      });
  }, []);

  const fetchAllData = async (id: string) => {
    if (!id) return;
    setLoading(true);

    try {
      const [healthRes, predRes, anomaliesRes, patternsRes, currentRes] = await Promise.all([
        fetch(`${getApiUrl(API_CONFIG.endpoints.macetaAnalysisHealthScore(parseInt(id)))}?hours=48`),
        fetch(`${getApiUrl(API_CONFIG.endpoints.macetaAnalysisIrrigation(parseInt(id)))}?hours=6`),
        fetch(`${getApiUrl(API_CONFIG.endpoints.macetaAnalysisAnomalies(parseInt(id)))}?hours=72&field=humedadSuelo`),
        fetch(`${getApiUrl(API_CONFIG.endpoints.macetaAnalysisPatterns(parseInt(id)))}?hours=168`),
        fetch(getApiUrl(API_CONFIG.endpoints.potCurrent(parseInt(id)))),
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (predRes.ok) setPrediction(await predRes.json());
      if (anomaliesRes.ok) setAnomalies(await anomaliesRes.json());
      if (patternsRes.ok) setPatterns(await patternsRes.json());
      if (currentRes.ok) setCurrentStats((await currentRes.json()).data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMaceta) fetchAllData(selectedMaceta);
  }, [selectedMaceta]);

  const currentMaceta = macetas.find(m => m.macetaId.toString() === selectedMaceta);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      EXCELENTE: "bg-emerald-500",
      BUENO: "bg-cyan-500",
      REGULAR: "bg-yellow-500",
      MALO: "bg-orange-500",
      CRÍTICO: "bg-red-600",
    };
    return map[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-24 h-24 text-emerald-600 animate-pulse mx-auto mb-6" />
          <p className="text-3xl font-bold text-gray-700">Analizando a {currentMaceta?.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div>
            <h1 className="text-6xl font-black text-gray-800 flex items-center gap-4">
              <Brain className="w-16 h-16 text-emerald-600" />
              Análisis Inteligente
            </h1>
            <p className="text-2xl text-gray-600 mt-2">Todo sobre tu planta</p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedMaceta} onValueChange={setSelectedMaceta}>
              <SelectTrigger className="w-80 text-lg font-medium bg-white/95 backdrop-blur shadow-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {macetas.map(m => (
                  <SelectItem key={m.macetaId} value={m.macetaId.toString()}>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{m.emoji}</span>
                      <div>
                        <p className="font-bold text-lg">{m.name}</p>
                        <p className="text-sm text-gray-500">Maceta {m.macetaId} • {m.mood || "Feliz"}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="lg" onClick={() => fetchAllData(selectedMaceta)} className="shadow-xl">
              <RefreshCw className={cn("w-6 h-6", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        {currentMaceta && (
          <Card className="mb-10 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-10 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="text-9xl">{currentMaceta.emoji}</div>
                  <div>
                    <h2 className="text-6xl font-black">{currentMaceta.name}</h2>
                    <p className="text-3xl opacity-90">Maceta {currentMaceta.macetaId}</p>
                    {currentMaceta.mood && <p className="text-2xl mt-3 opacity-80">Ánimo: {currentMaceta.mood}</p>}
                  </div>
                </div>
                {currentMaceta.needsWater && (
                  <Badge className="text-3xl px-10 py-5 bg-red-600 animate-pulse">
                    <Droplets className="w-10 h-10 mr-3" />
                    Necesita Riego
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Salud General + Stats Actuales */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Salud General */}
          {health && (
            <Card className="lg:col-span-2 p-10 bg-white/95 backdrop-blur shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="p-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl">
                    <Target className="w-20 h-20 text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black">Salud General</h3>
                    <p className="text-xl text-gray-600">Últimas {health.period.hours}h • {health.period.dataPoints} registros</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-9xl font-black text-gray-800">{health.overallScore}</div>
                  <Badge className={cn("text-3xl px-10 py-4 mt-4", getStatusColor(health.status))}>
                    {health.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                {Object.entries(health.components).map(([key, val]: any) => (
                  <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      {key === "temperatura" && <Thermometer className="w-12 h-12 text-orange-500" />}
                      {key === "humedadSuelo" && <Droplets className="w-12 h-12 text-blue-600" />}
                      {key === "humedadAire" && <CloudRain className="w-12 h-12 text-cyan-500" />}
                      <span className="text-5xl font-bold">{val.score}</span>
                    </div>
                    <p className="text-xl font-semibold capitalize">
                      {key === "humedadSuelo" ? "Humedad Suelo" : key === "humedadAire" ? "Humedad Aire" : "Temperatura"}
                    </p>
                    <Progress value={val.score} className="h-4 mt-3" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Stats Actuales */}
          {currentStats && (
            <Card className="p-10 bg-white/95 backdrop-blur shadow-2xl">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-4">
                <Activity className="w-10 h-10 text-emerald-600" />
                Estado Actual
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-2xl">
                  <span className="flex items-center gap-3"><Thermometer className="w-8 h-8 text-orange-500" /> Temperatura</span>
                  <span className="font-bold">{currentStats.temperatura}°C</span>
                </div>
                <div className="flex justify-between items-center text-2xl">
                  <span className="flex items-center gap-3"><Droplets className="w-8 h-8 text-blue-600" /> Hum. Suelo</span>
                  <span className="font-bold">{currentStats.humedadSuelo}%</span>
                </div>
                <div className="flex justify-between items-center text-2xl">
                  <span className="flex items-center gap-3"><CloudRain className="w-8 h-8 text-cyan-500" /> Hum. Aire</span>
                  <span className="font-bold">{currentStats.humedadAire}%</span>
                </div>
                <div className="flex justify-between items-center text-2xl">
                  <span className="flex items-center gap-3"><Sun className="w-8 h-8 text-yellow-500" /> Luz</span>
                  <span className="font-bold">{currentStats.luz ? "Sí" : "No"}</span>
                </div>
                {currentStats.presionAtmosferica && (
                  <div className="flex justify-between items-center text-2xl">
                    <span className="flex items-center gap-3"><Wind className="w-8 h-8 text-gray-500" /> Presión</span>
                    <span className="font-bold">{currentStats.presionAtmosferica} hPa</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Predicción de Riego */}
        {prediction?.prediction && (
          <Card className={cn("p-12 mb-10 text-white shadow-3xl", prediction.prediction.needed ? "bg-gradient-to-br from-red-500 to-pink-600" : "bg-gradient-to-br from-emerald-500 to-teal-600")}>
            <div className="text-center">
              <Droplets className="w-32 h-32 mx-auto mb-6 opacity-90" />
              <h2 className="text-6xl font-black mb-6">
                {prediction.prediction.needed ? "¡Necesita Riego YA!" : "Está Perfectamente Hidratada"}
              </h2>
              <div className="flex justify-center gap-12 text-3xl">
                <div>
                  <p className="text-white/80">Confianza</p>
                  <p className="text-7xl font-black">{prediction.prediction.confidence}%</p>
                </div>
                {prediction.prediction.recommendation && (
                  <div>
                    <p className="text-white/80">Riego sugerido</p>
                    <p className="text-8xl font-black">{prediction.prediction.recommendation.duration}s</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="anomalies" className="mt-16">
          <TabsList className="grid w-full grid-cols-4 h-20 text-xl font-bold bg-white/90 backdrop-blur-xl shadow-2xl">
            <TabsTrigger value="anomalies">Anomalías</TabsTrigger>
            <TabsTrigger value="patterns">Patrones</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="anomalies" className="mt-8">
            <Card className="p-16 text-center bg-white/95 backdrop-blur shadow-2xl">
              {anomalies?.anomaliesFound === 0 ? (
                <div className="py-20">
                  <CheckCircle2 className="w-32 h-32 text-emerald-600 mx-auto mb-8" />
                  <p className="text-5xl font-black text-gray-800">¡Ninguna anomalía!</p>
                  <p className="text-2xl text-gray-600 mt-4">{currentMaceta?.name} está en perfecto estado</p>
                </div>
              ) : (
                <div>
                  <AlertTriangle className="w-32 h-32 text-orange-600 mx-auto mb-8" />
                  <p className="text-6xl font-black text-orange-600">{anomalies?.anomaliesFound} anomalías detectadas</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-8">
            <Card className="p-10 bg-white/95 backdrop-blur shadow-2xl">
              <h3 className="text-4xl font-black mb-8 text-center">Recomendaciones para {currentMaceta?.name}</h3>
              <div className="space-y-6">
                {health?.recommendations?.length ? (
                  health.recommendations.slice(0, 5).map((r: any, i: number) => (
                    <div key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-3xl shadow-xl flex items-center gap-6">
                      <div className={cn("p-6 rounded-full", r.priority === "CRITICAL" ? "bg-red-500" : r.priority === "HIGH" ? "bg-orange-500" : "bg-yellow-500")}>
                        <AlertCircle className="w-12 h-12 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold">{r.action}</p>
                        <p className="text-lg text-gray-600 mt-2">{r.reason}</p>
                      </div>
                      <Badge className={cn("text-xl px-6 py-3", r.priority === "CRITICAL" ? "bg-red-600" : "bg-orange-500")}>
                        {r.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-3xl text-gray-600 py-20">¡Todo perfecto! No hay recomendaciones</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-8">
            <Card className="p-20 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center shadow-3xl">
              <Sparkles className="w-40 h-40 mx-auto mb-10 opacity-80" />
              <h3 className="text-7xl font-black mb-6">
                {currentMaceta?.name} está {health?.status.toLowerCase()}
              </h3>
              <p className="text-4xl leading-relaxed max-w-4xl mx-auto">
                {currentMaceta?.name} te agradece tus cuidados. ¡Sigue así!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}