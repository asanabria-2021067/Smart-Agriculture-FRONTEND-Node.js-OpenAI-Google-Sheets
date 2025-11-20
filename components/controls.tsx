"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Droplets,
  SettingsIcon,
  Bell,
  Info,
  Zap,
  Activity,
  CircleDot,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import WateringAnimation from "@/components/watering-animation";
import { API_CONFIG, getApiUrl, apiRequest } from "@/lib/config";

export default function Controls() {
  const [autoMode, setAutoMode] = useState(false);
  const [selectedPot, setSelectedPot] = useState<number | null>(null);
  const [duration, setDuration] = useState([30]);
  const [isWatering, setIsWatering] = useState(false);
  const [irrigationStatus, setIrrigationStatus] = useState<any>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [lowerAngle, setLowerAngle] = useState(65);
  const [upperAngle, setUpperAngle] = useState(90);
  const [pumpOn, setPumpOn] = useState(false);
  const handleBaseMove = async (direction: "left" | "right" | "stop") => {
    setIsMoving(direction !== "stop");
    await apiRequest(API_CONFIG.endpoints.servo.base, {
      method: "POST",
      body: JSON.stringify({ direction }),
    });
  };

  const handleLowerMove = async (delta: number) => {
    const newAngle = Math.max(0, Math.min(180, lowerAngle + delta));
    setLowerAngle(newAngle);
    await apiRequest(API_CONFIG.endpoints.servo.lowerArm, {
      method: "POST",
      body: JSON.stringify({ angle: newAngle }),
    });
  };

  const handleUpperMove = async (delta: number) => {
    const newAngle = Math.max(0, Math.min(180, upperAngle + delta));
    setUpperAngle(newAngle);
    await apiRequest(API_CONFIG.endpoints.servo.upperArm, {
      method: "POST",
      body: JSON.stringify({ angle: newAngle }),
    });
  };

  const togglePump = async () => {
    const endpoint = pumpOn
      ? API_CONFIG.endpoints.pump.off
      : API_CONFIG.endpoints.pump.on;

    const res = await apiRequest(endpoint, { method: "POST" });

    if (res?.success) {
      setPumpOn(!pumpOn);
    }
  };

  const toggleAutoMode = async (checked: boolean) => {
    try {
      // 1️⃣ Actualizamos UI al instante
      setAutoMode(checked);

      // 2️⃣ Llamamos al backend para cambiar el modo
      const response = await apiRequest(API_CONFIG.endpoints.auto, {
        method: "POST",
        body: JSON.stringify({ autoMode: checked }),
      });
    } catch (error) {
      console.error("Error al cambiar modo automático:", error);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          getApiUrl(API_CONFIG.endpoints.irrigationStatus)
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setIrrigationStatus(data.data);
        setAutoMode(data.data?.autoMode || false);
      } catch (error) {
        console.error("Error fetching irrigation status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWater = async () => {
    const seconds = duration[0]; // viene del slider
    setIsWatering(true);

    try {
      // 1️⃣ Encender bomba
      await apiRequest(API_CONFIG.endpoints.pump.on, { method: "POST" });

      console.log(`⏳ Regando durante ${seconds} segundos...`);

      // 2️⃣ Esperar el tiempo seleccionado
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

      // 3️⃣ Apagar bomba
      await apiRequest(API_CONFIG.endpoints.pump.off, { method: "POST" });

      console.log("✅ Riego finalizado.");
    } catch (error) {
      console.error("❌ Error en riego manual:", error);
    } finally {
      setIsWatering(false);
      setPumpOn(false); // sincroniza el switch con la realidad
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-balance">
              Control del Sistema
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gestiona tu brazo robótico y sistema de riego inteligente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {/* Robotic Arm Control */}
            <Card className="p-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-blue-950/20 dark:via-card dark:to-purple-950/20 border-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CircleDot className="w-6 h-6 text-blue-600" />
                    Brazo Robótico
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Control de movimiento en tiempo real
                  </p>
                </div>
                <Badge
                  variant={isMoving ? "default" : "secondary"}
                  className={cn(
                    "text-sm px-3 py-1",
                    isMoving && "animate-pulse bg-green-500"
                  )}
                >
                  {isMoving ? "Activo" : "En reposo"}
                </Badge>
              </div>

              <div className="bg-gradient-to-br from-accent/30 to-accent/10 rounded-xl p-6 mb-6">
                <p className="text-sm font-medium mb-4 text-center">
                  Controles Direccionales
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  <div />
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 w-full bg-background hover:bg-primary hover:text-primary-foreground transition-all shadow-md hover:shadow-lg hover:scale-105"
                    onMouseDown={() => handleLowerMove(-10)}
                  >
                    <ArrowUp className="w-8 h-8" />
                  </Button>
                  <div />

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 w-full bg-background hover:bg-primary hover:text-primary-foreground transition-all shadow-md hover:shadow-lg hover:scale-105"
                    onMouseDown={() => handleBaseMove("left")}
                    onMouseUp={() => handleBaseMove("stop")}
                  >
                    <ArrowLeft className="w-8 h-8" />
                  </Button>

                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full bg-primary transition-all",
                          isMoving && "animate-pulse scale-150"
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 w-full bg-background hover:bg-primary hover:text-primary-foreground transition-all shadow-md hover:shadow-lg hover:scale-105"
                    onMouseDown={() => handleBaseMove("right")}
                    onMouseUp={() => handleBaseMove("stop")}
                  >
                    <ArrowRight className="w-8 h-8" />
                  </Button>

                  <div />
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 w-full bg-background hover:bg-primary hover:text-primary-foreground transition-all shadow-md hover:shadow-lg hover:scale-105"
                    onMouseDown={() => handleLowerMove(10)}
                  >
                    <ArrowDown className="w-8 h-8" />
                  </Button>
                  <div />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold">
                      Brazo Inferior
                    </label>
                    <div className="text-2xl font-bold text-blue-600">
                      {lowerAngle}°
                    </div>
                  </div>
                  <input
                    type="range"
                    min={125}
                    max={165}
                    value={lowerAngle}
                    onChange={(e) => {
                      const angle = Number(e.target.value);
                      setLowerAngle(angle);
                      handleLowerMove(angle - lowerAngle);
                    }}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-blue-200 dark:bg-blue-900/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:bg-blue-700 [&::-webkit-slider-thumb]:transition-all"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>125°</span>
                    <span>165°</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold">
                      Brazo Superior
                    </label>
                    <div className="text-2xl font-bold text-purple-600">
                      {upperAngle}°
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={180}
                    value={upperAngle}
                    onChange={(e) => {
                      const angle = Number(e.target.value);
                      setUpperAngle(angle);
                      handleUpperMove(angle - upperAngle);
                    }}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-purple-200 dark:bg-purple-900/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:bg-purple-700 [&::-webkit-slider-thumb]:transition-all"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0°</span>
                    <span>180°</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {isWatering && (
              <Card className="p-8 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-2 border-blue-500/20 shadow-lg">
                <WateringAnimation />
              </Card>
            )}

            <Card className="p-6 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 dark:from-green-950/20 dark:via-card dark:to-emerald-950/20 border-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Droplets className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Sistema de Riego</h2>
                  <p className="text-sm text-muted-foreground">
                    Control manual y automático
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 p-5 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          autoMode ? "bg-yellow-500/20" : "bg-muted"
                        )}
                      >
                        <Zap
                          className={cn(
                            "w-5 h-5 transition-colors",
                            autoMode
                              ? "text-yellow-600"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Modo Automático</p>
                        <p className="text-xs text-muted-foreground">
                          Riego inteligente por sensores
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={autoMode}
                      onCheckedChange={toggleAutoMode}
                      className="data-[state=checked]:bg-yellow-600"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-accent/30 rounded-xl p-5">
                    <label className="text-sm font-semibold mb-3 block">
                      Duración del Riego Manual
                    </label>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      min={5}
                      max={60}
                      step={5}
                      className="w-full mb-3"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">5 seg</p>
                      <div className="text-2xl font-bold text-primary">
                        {duration[0]}s
                      </div>
                      <p className="text-xs text-muted-foreground">60 seg</p>
                    </div>
                  </div>

                  <Button
                    className={cn(
                      "w-full h-16 text-lg font-semibold",
                      "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
                      "shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]",
                      isWatering && "animate-pulse"
                    )}
                    onClick={handleWater}
                    disabled={isWatering}
                  >
                    <Droplets className="w-6 h-6 mr-2" />
                    {isWatering ? "Regando..." : "Iniciar Riego"}
                  </Button>
                </div>
              </div>
              {/* 🔵 CONTROL DE BOMBA MANUAL */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        pumpOn ? "bg-blue-500/20" : "bg-muted"
                      )}
                    >
                      <Droplets
                        className={cn(
                          "w-5 h-5 transition-colors",
                          pumpOn ? "text-blue-600" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">Bomba de Agua</p>
                      <p className="text-xs text-muted-foreground">
                        Control manual inmediato
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={pumpOn}
                    onCheckedChange={togglePump}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </Card>

            {irrigationStatus && (
              <Card className="p-5 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        irrigationStatus.isActive
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-400"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {irrigationStatus.isActive
                          ? "Sistema Activo"
                          : "Sistema Inactivo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Último riego:{" "}
                        {irrigationStatus.lastIrrigation
                          ? new Date(
                              irrigationStatus.lastIrrigation
                            ).toLocaleString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
