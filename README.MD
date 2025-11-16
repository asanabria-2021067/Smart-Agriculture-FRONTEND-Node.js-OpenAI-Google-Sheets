# 🚀 Guía de Instalación Completa - Backend

## 📋 Pre-requisitos

- Node.js 18+ instalado
- Cuenta de Google con acceso a Google Cloud
- API Key de OpenAI con créditos disponibles
- Git (opcional)

---

## 📁 Paso 1: Estructura del Proyecto

Crea la siguiente estructura de carpetas:

```bash
mkdir smart-agriculture-backend
cd smart-agriculture-backend
mkdir -p src/{config,services,routes,middleware,utils,logs}
```

---

## 📦 Paso 2: Inicializar Proyecto

```bash
# Inicializar npm
npm init -y

# Instalar dependencias
npm install express cors dotenv ws openai googleapis axios date-fns helmet compression

# Instalar dependencias de desarrollo
npm install -D nodemon
```

---

## 🔑 Paso 3: Configurar Google Sheets API

### 3.1 Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en "Nuevo Proyecto"
3. Nombra tu proyecto: "Smart Agriculture"
4. Click "Crear"

### 3.2 Habilitar Google Sheets API

1. En el menú lateral, ve a "APIs y Servicios" → "Biblioteca"
2. Busca "Google Sheets API"
3. Click "Habilitar"

### 3.3 Crear Service Account

1. Ve a "APIs y Servicios" → "Credenciales"
2. Click "+ CREAR CREDENCIALES" → "Cuenta de servicio"
3. Nombre: "agriculture-bot"
4. Click "Crear y continuar"
5. Rol: "Editor" (o "Visor" si solo lees datos)
6. Click "Listo"

### 3.4 Descargar Credenciales

1. Click en la cuenta de servicio recién creada
2. Pestaña "Claves"
3. "Agregar clave" → "Crear clave nueva"
4. Tipo: JSON
5. Guarda el archivo como `credentials.json` en la raíz del proyecto

### 3.5 Compartir Google Sheet

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/1mu_XPx8Y8HyhZxuNr9-tcL06VuVedWquz7jqqPjHIEM
2. Click "Compartir"
3. Pega el email del service account (está en `credentials.json`, campo `client_email`)
4. Permisos: "Viewer" o "Editor"
5. Click "Enviar"

---

## 🔐 Paso 4: Crear archivo .env

Crea un archivo `.env` en la raíz:

```env
# OpenAI
OPENAI_API_KEY=tu_api_key_aqui
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# Google Sheets
GOOGLE_SPREADSHEET_ID=1mu_XPx8Y8HyhZxuNr9-tcL06VuVedWquz7jqqPjHIEM
GOOGLE_SHEET_NAME=Datos

# Server
PORT=3000
NODE_ENV=development
LOG_TO_FILE=false

# CUDA (opcional, para después)
CUDA_SERVER_URL=http://localhost:5000
CUDA_ENABLED=false

# Polling
SHEETS_POLL_INTERVAL=5000
```

**Importante:** Reemplaza `tu_api_key_aqui` con tu API key real de OpenAI.

---

## 📄 Paso 5: Copiar Archivos del Código

Copia todos los archivos de código proporcionados en sus respectivas carpetas:

```
src/
├── config/
│   ├── openai.js
│   ├── sheets.js
│   └── cuda.js
├── services/
│   ├── sheetsService.js
│   ├── aiAgent.js
│   └── dataAnalyzer.js
├── routes/
│   ├── chat.js
│   ├── sensors.js
│   └── analysis.js
├── middleware/
│   ├── errorHandler.js
│   └── logger.js
├── utils/
│   └── helpers.js
└── server.js
```

---

## 🎯 Paso 6: Configurar package.json

Agrega estos scripts a tu `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "node src/test.js"
  }
}
```

---

## ✅ Paso 7: Verificar Instalación

```bash
# Verificar estructura de archivos
ls -R src/

# Verificar que credentials.json existe
ls credentials.json

# Verificar que .env existe
cat .env
```

---

## 🚀 Paso 8: Iniciar el Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# O modo producción
npm start
```

Deberías ver:

```
✅ OpenAI configurado correctamente
✅ Google Sheets configurado correctamente
✅ Conexión con OpenAI exitosa
✅ Conexión con Google Sheets exitosa
✅ Google Sheets API inicializado
📊 Nuevos datos detectados: X filas
✅ ==================================================
✅  Servidor corriendo en puerto 3000
✅ ==================================================
```

---

## 🧪 Paso 9: Probar el Backend

### Opción A: Usar el script de tests

```bash
node src/test.js
```

### Opción B: Usar curl

```bash
# Health check
curl http://localhost:3000/health

# Datos actuales
curl http://localhost:3000/api/sensors/current

# Enviar mensaje al chat
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"¿Cómo está mi planta?"}'
```

### Opción C: Usar Postman o Thunder Client

Importa esta colección:

```json
{
  "name": "Smart Agriculture API",
  "requests": [
    {
      "name": "Health Check",
      "method": "GET",
      "url": "http://localhost:3000/health"
    },
    {
      "name": "Chat Message",
      "method": "POST",
      "url": "http://localhost:3000/api/chat/message",
      "body": {
        "userId": "user1",
        "message": "¿Cuál es la temperatura actual?"
      }
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: Google Sheets 403 (Permission Denied)

1. Verifica que el service account email esté correcto
2. Asegúrate de haber compartido el Sheet
3. Verifica que `credentials.json` esté en la raíz

### Error: OpenAI 401 (Authentication Failed)

1. Verifica que la API key sea correcta
2. Verifica que tengas créditos en OpenAI
3. Asegúrate de que no haya espacios en la key

### Error: "GOOGLE_SPREADSHEET_ID no está configurado"

Verifica que el archivo `.env` exista y tenga las variables correctas.

### No hay datos en el cache

1. Verifica que el ESP32 esté enviando datos a Google Sheets
2. Verifica que la hoja se llame exactamente "Datos"
3. Verifica el formato de las columnas

---

## 🔄 Actualizar Datos

El backend hace polling cada 5 segundos (configurable en `.env`).

Para forzar actualización:

```bash
curl -X POST http://localhost:3000/api/sensors/refresh
```

---

## 📊 Endpoints Disponibles

### Chat

- `POST /api/chat/message` - Enviar mensaje
- `POST /api/chat/clear` - Limpiar historial
- `GET /api/chat/stats` - Estadísticas del chat

### Sensores

- `GET /api/sensors/current` - Datos actuales
- `GET /api/sensors/history?hours=24` - Historial
- `GET /api/sensors/stats?hours=24` - Estadísticas
- `GET /api/sensors/charts?type=both` - Datos para gráficas

### Análisis

- `GET /api/analysis/complete` - Análisis completo
- `GET /api/analysis/irrigation-prediction` - Predicción de riego
- `GET /api/analysis/health-score` - Score de salud
- `GET /api/analysis/summary` - Resumen ejecutivo
