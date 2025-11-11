export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws',
  endpoints: {
    chat: '/api/chat/message',
    
    sensorsCurrent: '/api/sensors/current',
    sensorsHistory: '/api/sensors/history',
    sensorsStats: '/api/sensors/stats',
    
    irrigationStatus: '/api/irrigation/status',
    irrigationManual: '/api/irrigation/manual',
    irrigationAuto: '/api/irrigation/auto',
    
    health: '/health',
  }
}

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseURL}${endpoint}`
}