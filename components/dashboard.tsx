"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Thermometer,
  Droplets,
  Cloud,
  Sun,
  Zap,
  Activity,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { API_CONFIG, getApiUrl } from "@/lib/config";

interface SensorData {
  temperatura: number;
  humedadSuelo: number;
  humedadAire: number;
  luz: boolean;
  timestamp: string;
}

interface Stats {
  totalRiegos: number;
  consumoAguaLitros: number;
  consumoEnergiaKWh: number;
}

export default function Dashboard() {
  const [current, setCurrent] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRiegos: 0,
    consumoAguaLitros: 0,
    consumoEnergiaKWh: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentRes, historyRes] = await Promise.all([
        fetch(getApiUrl(API_CONFIG.endpoints.sensorsCurrent)),
        fetch(getApiUrl(API_CONFIG.endpoints.sensorsHistory) + "?hours=48"),
      ]);

      // Current Data
      if (currentRes.ok) {
        const json = await currentRes.json();
        if (json.success && json.data) {
          setCurrent({
            temperatura: json.data.temperatura,
            humedadSuelo: json.data.humedadSuelo,
            humedadAire: json.data.humedadAire,
            luz: json.data.luz,
            timestamp: json.data.timestamp || new Date().toISOString(),
          });
        }
      }

      // History + Cálculo de riegos
      if (historyRes.ok) {
        const json = await historyRes.json();
        if (json.success && json.data) {
          const data = json.data;
          setHistory(data);

          const riegos = data.filter((d: any) => d.tiempoRiego > 0);
          const aguaTotal = riegos.reduce((sum: number, r: any) => sum + (r.consumoAgua || 0), 0);
          const energiaTotal = riegos.reduce((sum: number, r: any) => sum + (r.consumoEnergia || 0), 0);

          // Actualizamos stats SIN sobrescribir con null
          setStats({
            totalRiegos: riegos.length,
            consumoAguaLitros: Number(aguaTotal.toFixed(2)),
            consumoEnergiaKWh: Number(energiaTotal.toFixed(4)),
          });
        }
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  const chartData = history.slice(-40).map((item: any) => ({
    hora: new Date(item.timestamp || item.fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temp: Number(item.temperatura.toFixed(1)),
    suelo: Number(item.humedadSuelo.toFixed(0)),
  }));

  if (loading && !current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xl font-medium text-gray-700">Cargando tu jardín...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50 overflow-hidden relative">
      {/* Fondo animado sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-gray-800 flex items-center gap-4">
                <Sparkles className="w-12 h-12 text-emerald-600" />
                Plantas de Bird
              </h1>
              <p className="text-lg text-gray-600 mt-2">Monitoreo global • {new Date().toLocaleDateString("es-ES")}</p>
            </div>
            <Button
              onClick={fetchAllData}
              size="lg"
              className=" backdrop-blur-md shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              <RefreshCw className={cn("w-5 h-5 mr-3", loading && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Tarjetas principales */}
        <div className="px-6 py-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <Thermometer className="w-10 h-10 text-orange-500" />
              <span className="text-sm text-gray-500">Ambiente</span>
            </div>
            <p className="text-4xl font-black text-gray-800">
              {current?.temperatura.toFixed(1) || "--"}°C
            </p>
            <p className="text-sm text-gray-600 mt-2">Temperatura actual</p>
          </Card>

          <Card className="p-8 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all hover:-translate-y-2">
            <div className="flex items-center justify-between mb-between mb-4">
              <Droplets className="w-10 h-10 text-blue-500" />
              <span className="text-sm text-gray-500">Suelo</span>
            </div>
            <p className="text-4xl font-black text-gray-800">
              {current?.humedadSuelo.toFixed(0) || "--"}%
            </p>
            <p className="text-sm text-gray-600 mt-2">Humedad promedio</p>
          </Card>

          <Card className="p-8 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <Cloud className="w-10 h-10 text-cyan-500" />
              <span className="text-sm text-gray-500">Aire</span>
            </div>
            <p className="text-4xl font-black text-gray-800">
              {current?.humedadAire.toFixed(0) || "--"}%
            </p>
            <p className="text-sm text-gray-600 mt-2">Humedad ambiental</p>
          </Card>

          <Card className="p-8 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <Sun className="w-10 h-10 text-yellow-500" />
              <span className="text-sm text-gray-500">Luz solar</span>
            </div>
            <p className="text-4xl font-black text-gray-800">
              {current?.luz ? "Sí" : "No"}
            </p>
            <p className="text-sm text-gray-600 mt-2">Detectada</p>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="px-6 py-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="p-8 bg-white/90 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <Thermometer className="w-8 h-8 text-orange-500" />
              Temperatura Últimas Horas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                <XAxis dataKey="hora" stroke="#666" fontSize={13} />
                <YAxis stroke="#666" fontSize={13} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                />
                <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-8 bg-white/90 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <Droplets className="w-8 h-8 text-blue-500" />
              Humedad del Suelo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                <XAxis dataKey="hora" stroke="#666" fontSize={13} />
                <YAxis stroke="#666" fontSize={13} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                />
                <Line type="monotone" dataKey="suelo" stroke="#3b82f6" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tarjetas de consumo - AHORA SÍ SE MANTIENEN LOS VALORES */}
        <div className="px-6 pb-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-10 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
              <Droplets className="w-16 h-16 mb-4 opacity-90" />
              <p className="text-lg opacity-90">Consumo de Agua</p>
              <p className="text-5xl font-black mt-3">
                {stats.consumoAguaLitros} <span className="text-2xl">L</span>
              </p>
              <p className="text-sm mt-3 opacity-80">Últimas 48h</p>
            </Card>

            <Card className="p-10 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
              <Zap className="w-16 h-16 mb-4 opacity-90" />
              <p className="text-lg opacity-90">Energía Consumida</p>
              <p className="text-5xl font-black mt-3">
                {stats.consumoEnergiaKWh} <span className="text-2xl">kWh</span>
              </p>
              <p className="text-sm mt-3 opacity-80">Total acumulado</p>
            </Card>

            <Card className="p-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
              <Sparkles className="w-16 h-16 mb-4 opacity-90" />
              <p className="text-lg opacity-90">Riegos Automáticos</p>
              <p className="text-6xl font-black mt-4">{stats.totalRiegos}</p>
              <p className="text-sm mt-3 opacity-3 opacity-80">En las últimas 48h</p>
            </Card>
          </div>
        </div>

        {/* Footer sutil */}
        <div className="text-center py-8 text-gray-500 text-sm">
          Sistema de Riego Inteligente © 2025 • Actualizado cada 8 segundos
        </div>
      </div>
    </div>
  );
}