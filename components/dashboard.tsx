"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  RefreshCw,
  Thermometer,
  Droplets,
  Cloud,
  Sun,
  Sparkles,
  Activity,
  AlertCircle,
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
import PlantScene from "@/components/plant-scene";
import { API_CONFIG, getApiUrl } from "@/lib/config";

interface SensorData {
  temperature: number;
  soilHumidity: number;
  airHumidity: number;
  light: boolean;
  timestamp: string;
}

interface Stats {
  count: number;
  temperatura: {
    promedio: number;
    min: number;
    max: number;
  };
  humedadSuelo: {
    promedio: number;
    min: number;
    max: number;
    tendencia: string;
  };
  humedadAire: {
    promedio: number;
    min: number;
    max: number;
  };
  totalRiegos: number;
  consumoTotal: {
    agua: string;
    energia: string;
  };
  ultimoRiego: string;
}

export default function Dashboard() {
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ========== CURRENT DATA ==========
      const currentResponse = await fetch(
        getApiUrl(API_CONFIG.endpoints.sensorsCurrent)
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Error en /current: ${currentResponse.status}`);
      }
      
      const currentJson = await currentResponse.json();

      if (currentJson.success && currentJson.data) {
        // ✅ Mapear correctamente del backend (español) al frontend (inglés)
        setCurrentData({
          temperature: currentJson.data.temperatura,
          soilHumidity: currentJson.data.humedadSuelo,
          airHumidity: currentJson.data.humedadAire,
          light: currentJson.data.luz,
          timestamp: currentJson.data.timestamp || currentJson.data.fecha,
        });
      }

      // ========== HISTORY ==========
      const historyResponse = await fetch(
        getApiUrl(API_CONFIG.endpoints.sensorsHistory) + "?hours=24"
      );
      
      if (historyResponse.ok) {
        const historyJson = await historyResponse.json();
        if (historyJson.success && historyJson.data) {
          setHistoryData(historyJson.data);
        }
      }

      // ========== STATS ==========
      try {
        const statsResponse = await fetch(
          getApiUrl(API_CONFIG.endpoints.sensorsStats) + "?hours=24&metric=all"
        );

        if (statsResponse.ok) {
          const statsJson = await statsResponse.json();

          if (statsJson.success && statsJson.data) {
            const statsData = statsJson.data;

            setStats({
              count: statsJson.meta?.sampleSize || 0,
              temperatura: {
                promedio: statsData.temperatura?.stats?.mean || 0,
                min: statsData.temperatura?.stats?.min || 0,
                max: statsData.temperatura?.stats?.max || 0,
              },
              humedadSuelo: {
                promedio: statsData.humedadSuelo?.stats?.mean || 0,
                min: statsData.humedadSuelo?.stats?.min || 0,
                max: statsData.humedadSuelo?.stats?.max || 0,
                tendencia:
                  statsData.humedadSuelo?.trend?.direction || "ESTABLE",
              },
              humedadAire: {
                promedio: statsData.humedadAire?.stats?.mean || 0,
                min: statsData.humedadAire?.stats?.min || 0,
                max: statsData.humedadAire?.stats?.max || 0,
              },
              totalRiegos: 0,
              consumoTotal: {
                agua: "0",
                energia: "0",
              },
              ultimoRiego: "N/A",
            });
          }
        } else {
          console.warn(
            `Stats endpoint retornó ${statsResponse.status}, se calcularán desde history`
          );
        }
      } catch (statsError) {
        console.warn("Error obteniendo stats, continuando sin ellos:", statsError);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ========== CALCULAR RIEGOS DESDE HISTORY ==========
  useEffect(() => {
    if (historyData.length > 0 && stats) {
      const riegos = historyData.filter((d) => d.tiempoRiego > 0);
      const totalAgua = riegos.reduce((sum, r) => sum + r.consumoAgua, 0);
      const totalEnergia = riegos.reduce((sum, r) => sum + r.consumoEnergia, 0);
      const ultimoRiego =
        riegos.length > 0 ? riegos[riegos.length - 1].fecha : "N/A";

      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalRiegos: riegos.length,
              consumoTotal: {
                agua: totalAgua.toFixed(2),
                energia: totalEnergia.toFixed(4),
              },
              ultimoRiego,
            }
          : null
      );
    }
  }, [historyData]);

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  // ✅ chartData usando nombres correctos del backend (español)
  const chartData = historyData.slice(-50).map((item) => ({
    time: formatTime(item.timestamp || item.fecha),
    temperatura: Number(item.temperatura.toFixed(1)),
    humedad: Number(item.humedadSuelo.toFixed(1)),
  }));

  // ========== ERROR SCREEN ==========
  if (error && !currentData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Error de Conexión</h3>
            <p className="text-sm text-muted-foreground mb-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Asegúrate de que el backend esté corriendo en:
            </p>
            <code className="block mt-2 text-xs bg-muted p-2 rounded">
              http://localhost:3000
            </code>
          </div>
          <Button onClick={fetchData} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar Conexión
          </Button>
        </Card>
      </div>
    );
  }

  // ========== LOADING SCREEN ==========
  if (loading && !currentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ========== HERO SECTION WITH 3D PLANT ========== */}
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
                <h1 className="text-3xl md:text-4xl font-bold text-balance">
                  Sistema de Riego
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Monitoreo en tiempo real
              </p>
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

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Error banner (si hay error pero tenemos datos en caché) */}
        {error && currentData && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Problema de conexión con el backend
                </p>
                <p className="text-xs text-muted-foreground">
                  Mostrando datos en caché. Reintentando...
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ========== SENSOR CARDS ========== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-1/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-1/20 ring-2 ring-chart-1/20">
                <Thermometer className="w-6 h-6 text-chart-1" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                Temperatura
              </span>
            </div>
            <div className="text-3xl font-bold text-balance">
              {currentData?.temperature?.toFixed(1) || "--"}°C
            </div>
            <div className="text-xs text-muted-foreground mt-2">Ambiente</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-2/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-2/20 ring-2 ring-chart-2/20">
                <Droplets className="w-6 h-6 text-chart-2" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                H. Suelo
              </span>
            </div>
            <div className="text-3xl font-bold text-balance">
              {currentData?.soilHumidity?.toFixed(1) || "--"}%
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Hidratación
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-3/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-3/20 ring-2 ring-chart-3/20">
                <Cloud className="w-6 h-6 text-chart-3" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                H. Aire
              </span>
            </div>
            <div className="text-3xl font-bold text-balance">
              {currentData?.airHumidity?.toFixed(1) || "--"}%
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Atmosférica
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-card to-chart-5/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-chart-5/20 ring-2 ring-chart-5/20">
                <Sun className="w-6 h-6 text-chart-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                Luz Solar
              </span>
            </div>
            <div className="text-3xl font-bold text-balance">
              {currentData?.light ? "Sí" : "No"}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Disponible</div>
          </Card>
        </div>

        {/* ========== CHARTS ========== */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Temperatura Chart */}
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-balance">
              Temperatura (24h)
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="time"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
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
                    dataKey="temperatura"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={{ fill: "var(--chart-1)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay datos disponibles</p>
                </div>
              </div>
            )}
          </Card>

          {/* Humedad Chart */}
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-balance">
              Humedad del Suelo (24h)
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="time"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
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
                    dataKey="humedad"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={{ fill: "var(--chart-2)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay datos disponibles</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-chart-2/20 via-card to-card hover:shadow-xl transition-all">
            <Droplets className="w-8 h-8 text-chart-2 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Consumo de Agua
            </p>
            <p className="text-3xl font-bold">
              {stats?.consumoTotal?.agua || "0"} L
            </p>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24h</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-chart-3/20 via-card to-card hover:shadow-xl transition-all">
            <Sun className="w-8 h-8 text-chart-3 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Energía Consumida
            </p>
            <p className="text-3xl font-bold">
              {stats?.consumoTotal?.energia || "0"} kWh
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total acumulado
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/20 via-card to-card hover:shadow-xl transition-all">
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Número de Riegos
            </p>
            <p className="text-3xl font-bold">{stats?.totalRiegos || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24h</p>
          </Card>
        </div>
      </div>
    </div>
  );
}