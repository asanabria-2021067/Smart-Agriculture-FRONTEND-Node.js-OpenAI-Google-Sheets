# 🌱 Smart Agriculture Frontend

<div align="center">
  <h3>📟 Tamagotchi-Style IoT Smart Farming Interface</h3>
  <p>Una interfaz gráfica interactiva diseñada en React para el monitoreo en tiempo real y cuidado automatizado de cultivos/plantas, conectada a un brazo robótico de riego y potenciada con Inteligencia Artificial.</p>
</div>

---

## 🚀 Tecnologías y Herramientas

El frontend está estructurado para consumir datos en tiempo real e interactuar con actuadores físicos mediante las siguientes tecnologías:

*   **Framework:** React (con TypeScript o JavaScript ES6+)
*   **Estilos:** CSS3 / Tailwind CSS (animaciones fluidas para el estado de la planta)
*   **Integración de Datos:** Google Sheets API (como base de datos de logs e historial de sensores)
*   **Inteligencia Artificial:** OpenAI API (para el asesor agrónomo inteligente integrado)
*   **Control y Actuadores:** API de control de riego para brazo robótico (REST / WebSockets)

---

## 🛠️ Características Principales

### 🎮 Interfaz Estilo "Tamagotchi"
La salud de la planta se visualiza dinámicamente según las lecturas de los sensores. La interfaz cambia de estado emotivo (feliz, sedienta, con calor, en peligro) para dar una alerta visual inmediata del estado biológico de la planta.

### 📊 Integración con Google Sheets
Lectura de logs e historial de métricas directamente desde una hoja de cálculo de Google. Esto permite visualizar gráficos de temperatura, humedad del suelo, humedad ambiental y niveles de luz solar a lo largo del tiempo sin requerir una base de datos pesada.

### 🤖 Asesor Agrónomo con OpenAI (IA)
Módulo de chat interactivo que lee automáticamente los valores actuales de los sensores y, mediante el modelo GPT de OpenAI, proporciona recomendaciones exactas, diagnósticos de plagas, y alertas personalizadas de cuidado para el usuario.

### 🦾 Control del Brazo Robótico de Riego
Botonera y comandos interactivos que envían señales en tiempo real al backend para accionar el brazo de riego automatizado, permitiendo un riego preciso y focalizado en la planta seleccionada.

---

## ⚙️ Configuración del Entorno

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/asanabria-2021067/Smart-Agriculture-FRONTEND-Node.js-OpenAI-Google-Sheets.git
   cd Smart-Agriculture-FRONTEND-Node.js-OpenAI-Google-Sheets
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto para conectar los servicios del frontend y APIs externas:
   ```env
   # API URL del Backend de agricultura (brazo robótico y sockets)
   REACT_APP_BACKEND_URL="http://localhost:8080"
   
   # Opcional si se consume OpenAI o Google Sheets directamente en el cliente (o mediante el proxy de tu Backend)
   REACT_APP_OPENAI_API_KEY="tu_openai_key"
   REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID="id_de_tu_hoja_de_calculo"
   ```

4. **Inicia la aplicación en modo desarrollo:**
   ```bash
   npm start
   ```
   La aplicación se abrirá en `http://localhost:3000`.

---

## 📂 Estructura del Proyecto (Módulos Clave)

*   `src/components/TamagotchiView`: Componentes visuales y animaciones que cambian según las lecturas de los sensores.
*   `src/components/SensorsDashboard`: Tableros interactivos e históricos de temperatura, luz y humedad con gráficos interactivos.
*   `src/components/RobotControls`: Interfaz de botones para control manual y calibración del brazo robótico de riego.
*   `src/components/AIAssistant`: Chatbot interactivo conectado con OpenAI para diagnóstico de cultivo.
*   `src/services/sheetsService`: Módulo de conexión con la hoja de Google Sheets para lectura y escritura de logs.

---

## 📈 Scripts Disponibles

*   `npm start`: Inicia el servidor de desarrollo local.
*   `npm run build`: Compila la app optimizada para producción.
*   `npm test`: Corre las pruebas de la interfaz.

---
