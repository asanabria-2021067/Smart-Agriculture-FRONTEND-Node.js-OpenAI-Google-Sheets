/**
 * Configuración de la API del Backend
 *
 * Estructura de respuestas del backend:
 * - Exitosas: { success: true, data: {...}, message?: string }
 * - Errores: { success: false, error: string, code?: string }
 */

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",

  endpoints: {
    // === CHAT ENDPOINTS ===
    // POST /api/chat/message - Body: { userId: string, message: string, forceRefresh?: boolean }
    // Response: { success: true, userId: string, message: string, action: {...}, context: {...}, tokens: {...} }
    chat: "/api/chat/message",

    // POST /api/chat/clear - Body: { userId: string }
    // Response: { success: true, message: string }
    chatClear: "/api/chat/clear",

    // GET /api/chat/stats
    // Response: { success: true, stats: { activeUsers: number, totalMessages: number, users: [...] } }
    chatStats: "/api/chat/stats",

    // POST /api/chat/context - Body: { forceRefresh?: boolean }
    // Response: { success: true, context: {...}, timestamp: string }
    chatContext: "/api/chat/context",

    // === SENSORS ENDPOINTS ===
    // GET /api/sensors/current
    // Response: { success: true, data: SensorData }
    // SensorData: { fecha, timestamp, temperatura, humedadSuelo, humedadAire, luz, tiempoRiego, consumoAgua, consumoEnergia }
    sensorsCurrent: "/api/sensors/current",

    // GET /api/sensors/history?hours=24
    // Response: { success: true, data: SensorData[], meta: { hours, count, oldest, newest } }
    sensorsHistory: "/api/sensors/history",

    // GET /api/sensors/chart?type=all&hours=24
    // Response: { success: true, data: {...}, meta: {...} }
    sensorsChart: "/api/sensors/chart",

    // GET /api/sensors/stats?hours=24&metric=all
    // Response: { success: true, data: { temperatura: {...}, humedadSuelo: {...}, humedadAire: {...} }, meta: {...} }
    sensorsStats: "/api/sensors/stats",

    // GET /api/sensors/trends?hours=24
    // Response: { success: true, data: { temperatura: {...}, humedadSuelo: {...}, humedadAire: {...} }, meta: {...} }
    sensorsTrends: "/api/sensors/trends",

    // GET /api/sensors/anomalies?hours=24&sensitivity=media
    // Response: { success: true, data: { humedadSuelo: [...], temperatura: [...], humedadAire: [...] }, meta: {...} }
    sensorsAnomalies: "/api/sensors/anomalies",

    // POST /api/sensors/refresh
    // Response: { success: true, data: SensorData, timestamp: string }
    sensorsRefresh: "/api/sensors/refresh",

    // GET /api/sensors/realtime-status
    // Response: { success: true, data: { isPolling, pollInterval, lastUpdate, cacheSize, ... } }
    sensorsRealtimeStatus: "/api/sensors/realtime-status",

    // GET /api/sensors/summary?hours=24
    // Response: { success: true, data: { current, analysis, irrigation, period } }
    sensorsSummary: "/api/sensors/summary",

    // === IRRIGATION ENDPOINTS (Futuros - Preparados para el hardware) ===
    irrigationStatus: "/api/irrigation/status",
    irrigationManual: "/api/irrigation/manual",
    irrigationAuto: "/api/irrigation/auto",
    irrigationSchedule: "/api/irrigation/schedule",

    // === ANALYSIS ENDPOINTS ===
    // GET /api/analysis/complete?hours=24
    // Response: { success: true, hours, dataPoints, analysis: { temperatura, humedadSuelo, humedadAire }, generatedAt }
    analysisComplete: "/api/analysis/complete",

    // GET /api/analysis/field/:fieldName?hours=24
    // Response: { success: true, field, hours, analysis }
    analysisField: "/api/analysis/field",

    // GET /api/analysis/anomalies?hours=24&field=humedadSuelo&sensitivity=2
    // Response: { success: true, field, hours, sensitivity, anomaliesFound, anomalies }
    analysisAnomalies: "/api/analysis/anomalies",

    // GET /api/analysis/irrigation-prediction?hours=6
    // Response: { success: true, prediction: { needed, confidence, score, reasons, recommendation }, basedOnLastHours, dataPoints }
    analysisIrrigationPrediction: "/api/analysis/irrigation-prediction",

    // GET /api/analysis/daily-patterns?hours=48
    // Response: { patterns: { available, patterns, insights } }
    analysisDailyPatterns: "/api/analysis/daily-patterns",

    // GET /api/analysis/health-score?hours=24
    // Response: { success: true, overallScore, status, components, recommendations, detailedAnalysis }
    analysisHealthScore: "/api/analysis/health-score",

    // GET /api/analysis/summary
    // Response: { success: true, timestamp, current, trends, stats24h, irrigation, alerts, healthScore }
    analysisSummary: "/api/analysis/summary",

    // === macetas/MACETAS ENDPOINTS ===
    // GET /api/macetas - Listar todas las macetas
    // Response: { success: true, data: Pot[] }
    macetas: "/api/macetas",

    // GET /api/macetas/:id - Obtener maceta específica
    // Response: { success: true, data: Pot }
    pot: "/api/macetas/:id",

    // GET /api/macetas/:id/profile - Perfil completo de una maceta
    // Response: { success: true, data: { id, name, species, personality, health, stats, preferences } }
    potProfile: "/api/macetas/:id/profile",

    // GET /api/macetas/:id/stats - Estadísticas de una maceta
    // Response: { success: true, data: { current, history, analysis } }
    macetastats: "/api/macetas/:id/stats",

    // GET /api/macetas/:id/current - Datos actuales de sensores de una maceta
    // Response: { success: true, data: SensorData }
    potCurrent: "/api/macetas/:id/current",

    // GET /api/macetas/:id/history?hours=24 - Historial de una maceta
    // Response: { success: true, data: SensorData[] }
    potHistory: "/api/macetas/:id/history",

    // GET /api/macetas/:id/analysis - Análisis de una maceta
    // Response: { success: true, data: { health, recommendations, alerts } }
    potAnalysis: "/api/macetas/:id/analysis",

    // POST /api/macetas/:id/water - Registrar riego manual
    // Body: { amount: number, duration: number }
    // Response: { success: true, message: string }
    potWater: "/api/macetas/:id/water",

    // PUT /api/macetas/:id - Actualizar maceta
    // Body: { name?: string, species?: string, personality?: string }
    // Response: { success: true, data: Pot }
    potUpdate: "/api/macetas/:id",

    // === CHAT POR MACETA ENDPOINTS ===
    // POST /api/macetas/:id/chat - Enviar mensaje a una planta específica
    // Body: { message: string, userId?: string }
    // Response: { success: true, response: string, context: {...} }
    potChat: "/api/macetas/:id/chat",

    // GET /api/macetas/:id/chat/history - Historial de chat con una planta
    // Response: { success: true, data: ChatMessage[] }
    potChatHistory: "/api/macetas/:id/chat/history",

    // POST /api/macetas/:id/chat/clear - Limpiar historial de chat con una planta
    // Response: { success: true, message: string }
    potChatClear: "/api/macetas/:id/chat/clear",

    // === SYSTEM ENDPOINTS ===
    // GET /health
    // Response: { status, service, version, timestamp, components, dataCache }
    health: "/health",

    // === ROBOTIC ARM ENDPOINTS ===
    servo: {
      // Control individual de servos
      base: "/api/servo/base", // Servo 1 - 360° (giro)
      lowerArm: "/api/servo/lower", // Servo 2 - 180° (brazo inferior)
      upperArm: "/api/servo/upper", // Servo 3 - 180° (brazo superior)

      // Control combinado (opcional)
      move: "/api/servo/move", // POST { base: number, lower: number, upper: number }
    },
  },
};

/**
 * Construye la URL completa del endpoint
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

/**
 * Helper para construir URLs de endpoints de macetas individuales
 * Reemplaza :id en la ruta con el ID de la maceta
 */
export function getPotApiUrl(endpoint: string, potId: number): string {
  const url = endpoint.replace(":id", potId.toString());
  return getApiUrl(url);
}

/**
 * Alias de getPotApiUrl para compatibilidad
 */
export const getMacetaApiUrl = getPotApiUrl;

/**
 * Helper para hacer peticiones con manejo de errores
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    console.log("➡️ API request to:", getApiUrl(endpoint), options);

    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Tipos de datos comunes
 */
export interface SensorData {
  fecha: string;
  timestamp: string;
  temperatura: number;
  humedadSuelo: number;
  humedadAire: number;
  luz: boolean;
  tiempoRiego: number;
  consumoAgua: number;
  consumoEnergia: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface Pot {
  id: number;
  name: string;
  species: string;
  personality: string;
  plantedDate: string;
  health: number;
  mood: string;
  avatar?: string;
}

export interface PotProfile extends Pot {
  stats: {
    totalWaterings: number;
    averageHealth: number;
    daysAlive: number;
  };
  preferences: {
    optimalTemp: { min: number; max: number };
    optimalHumidity: { min: number; max: number };
    wateringFrequency: string;
  };
}

export interface ChatMessage {
  id: string;
  potId: number;
  userId?: string;
  message: string;
  response: string;
  timestamp: string;
}
