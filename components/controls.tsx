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

  // === Servo base (360°) ===
  const handleBaseMove = async (direction: "left" | "right" | "stop") => {
    setIsMoving(direction !== "stop");
    await apiRequest(API_CONFIG.endpoints.servo.base, {
      method: "POST",
      body: JSON.stringify({ direction }),
    });
  };

  const handleBaseStop = async () => {
    await apiRequest(API_CONFIG.endpoints.servo.base, {
      method: "POST",
      body: JSON.stringify({ direction: "stop" }),
    });
  };
  // === Servo brazo inferior (180°) ===
  const handleLowerMove = async (delta: number) => {
    const newAngle = Math.max(0, Math.min(180, lowerAngle + delta));
    setLowerAngle(newAngle);
    await apiRequest(API_CONFIG.endpoints.servo.lowerArm, {
      method: "POST",
      body: JSON.stringify({ angle: newAngle }),
    });
  };

  // === Servo brazo superior (180°) ===
  const handleUpperMove = async (delta: number) => {
    const newAngle = Math.max(0, Math.min(180, upperAngle + delta));
    setUpperAngle(newAngle);
    await apiRequest(API_CONFIG.endpoints.servo.upperArm, {
      method: "POST",
      body: JSON.stringify({ angle: newAngle }),
    });
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
    setIsWatering(true);

    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.endpoints.irrigationManual),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration: duration[0] }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Irrigation started:", data);
    } catch (error) {
      console.error("Error starting irrigation:", error);
    }

    setTimeout(() => setIsWatering(false), duration[0] * 1000);
  };

  const handleAutoModeToggle = async (checked: boolean) => {
    setAutoMode(checked);

    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.endpoints.irrigationAuto),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: checked }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Auto mode toggled:", data);
    } catch (error) {
      console.error("Error toggling auto mode:", error);
      // Revertir el cambio si hay error
      setAutoMode(!checked);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 relative">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">
            Panel de Control
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu sistema de riego inteligente
          </p>
        </div>

        {/* Watering Animation */}
        {isWatering && (
          <Card className="p-8 bg-gradient-to-b from-secondary/20 to-card">
            <WateringAnimation />
          </Card>
        )}

        {/* Irrigation Controls */}
        <Card className="p-6 bg-gradient-to-br from-card to-accent/30">
          <h2 className="text-xl font-semibold mb-4 text-balance">
            Sistema de Riego
          </h2>

          <div className="space-y-4">
            {/* Manual Watering */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Duración del Riego</label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {duration[0]} segundos
              </p>

              <Button
                className={cn(
                  "w-full h-14 bg-gradient-to-r from-chart-2 to-chart-3 hover:opacity-90 transition-all",
                  isWatering && "animate-pulse"
                )}
                onClick={handleWater}
                disabled={isWatering}
              >
                <Droplets className="w-5 h-5 mr-2" />
                {isWatering ? "Regando..." : "Regar Ahora"}
              </Button>
            </div>

            {/* Auto Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className={cn("w-5 h-5", autoMode && "text-primary")} />
                <div>
                  <p className="font-medium">Modo Automático</p>
                  <p className="text-xs text-muted-foreground">
                    Riego basado en sensores
                  </p>
                </div>
              </div>
              <Switch
                checked={autoMode}
                onCheckedChange={handleAutoModeToggle}
              />
            </div>
          </div>
        </Card>

        {/* Robotic Arm Control */}
        <Card className="p-6 bg-gradient-to-br from-card to-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Control del Brazo Robótico
            </h2>
            <Badge
              variant={isMoving ? "default" : "secondary"}
              className="text-xs"
            >
              {isMoving ? "En movimiento" : "Listo"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Controla el brazo robótico en tiempo real. Usa los botones o los
            sliders.
          </p>

          {/* === Controles direccionales === */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            <div />
            <Button
              variant="outline"
              className="h-16"
              onMouseDown={() => handleLowerMove(-10)}
            >
              <ArrowUp className="w-6 h-6" />
            </Button>
            <div />

            <Button
              variant="outline"
              className="h-16"
              onMouseDown={() => handleBaseMove("left")}
              onMouseUp={() => handleBaseMove("stop")}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div />
            <Button
              variant="outline"
              className="h-16"
              onMouseDown={() => handleBaseMove("right")}
              onMouseUp={() => handleBaseMove("stop")}
            >
              <ArrowRight className="w-6 h-6" />
            </Button>

            <div />
            <Button
              variant="outline"
              className="h-16"
              onMouseDown={() => handleLowerMove(10)}
            >
              <ArrowDown className="w-6 h-6" />
            </Button>
            <div />
          </div>

          {/* === Sliders para ángulos finos === */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">
                Ángulo del brazo inferior: {lowerAngle}°
              </label>
              <input
                type="range"
                min={0}
                max={65}
                value={lowerAngle}
                onChange={(e) => {
                  const angle = Number(e.target.value);
                  setLowerAngle(angle);
                  handleLowerMove(angle - lowerAngle);
                }}
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Ángulo del brazo superior: {upperAngle}°
              </label>
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
                className="w-full mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Pot Selection */}
        <Card className="p-6 bg-gradient-to-br from-card to-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-balance">
              Selección de Maceta
            </h2>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((pot) => (
              <Button
                key={pot}
                variant={selectedPot === pot ? "default" : "outline"}
                disabled
                className={cn(
                  "h-20 w-full opacity-50",
                  selectedPot === pot && "pulse-glow-animation"
                )}
                onClick={() => setSelectedPot(pot)}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">{pot}</div>
                  <div className="text-xs">Maceta</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6 bg-gradient-to-br from-card to-accent/30">
          <h2 className="text-xl font-semibold mb-4 text-balance">
            Configuración
          </h2>

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" disabled>
              <SettingsIcon className="w-5 h-5 mr-3" />
              Horarios programados
            </Button>
            <Button variant="ghost" className="w-full justify-start" disabled>
              <SettingsIcon className="w-5 h-5 mr-3" />
              Umbrales de sensores
            </Button>
            <div className="flex items-center justify-between p-3 hover:bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <span>Notificaciones</span>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="ghost" className="w-full justify-start">
              <Info className="w-5 h-5 mr-3" />
              Acerca de
            </Button>
          </div>
        </Card>

        {/* Status Info */}
        {irrigationStatus && (
          <Card className="p-4 bg-accent/50">
            <p className="text-sm text-center text-muted-foreground">
              Estado: {irrigationStatus.isActive ? "Regando..." : "Inactivo"} |
              Último riego:{" "}
              {irrigationStatus.lastIrrigation
                ? new Date(irrigationStatus.lastIrrigation).toLocaleString(
                    "es-ES"
                  )
                : "N/A"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}