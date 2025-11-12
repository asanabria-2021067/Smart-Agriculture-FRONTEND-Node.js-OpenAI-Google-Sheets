"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Send,
  Bot,
  User,
  Trash2,
  Loader2,
  Sparkles,
  Thermometer,
  Droplets,
  Wind,
  HeartPulse,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_CONFIG, getApiUrl } from "@/lib/config"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const quickSuggestions = ["¿Cómo está mi planta?", "Muestra estadísticas", "¿Necesita agua?", "Datos de hoy"]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(getApiUrl(API_CONFIG.endpoints.chat), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user1", message: text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Lo siento, no pude procesar tu mensaje.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje. ¿Está el backend corriendo en localhost:3000?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = async () => {
    try {
      await fetch(getApiUrl(API_CONFIG.endpoints.chatClear), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user1" }),
      })
      setMessages([])
    } catch (error) {
      console.error("Error clearing chat:", error)
      setMessages([])
    }
  }

  // 🔍 Función para parsear mensajes enriquecidos
  const renderMessageContent = (message: Message) => {
    const { content } = message

    // Detectamos el formato con "Temperatura promedio"
    if (content.includes("Temperatura promedio")) {
      // Limpiamos markdown y extraemos las métricas
      const cleaned = content.replace(/\*\*/g, "")
      const tempMatch = cleaned.match(/Temperatura promedio:\s*([\d.]+°C)/)
      const humSueloMatch = cleaned.match(/Humedad del suelo promedio:\s*([\d.]+%)/)
      const humAireMatch = cleaned.match(/Humedad del aire promedio:\s*([\d.]+%)/)
      const estadoMatch = cleaned.match(/Estado de salud del sistema:\s*([A-ZÁÉÍÓÚÑ\s]+)\s*\(score:\s*(\d+\/\d+)\)/)

      const resumen = cleaned.split("La humedad del suelo")[1] || ""

      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">🌱 Estado general de tu planta</h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {tempMatch && (
              <Card className="p-3 flex flex-col items-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <Thermometer className="w-5 h-5 text-orange-600 mb-1" />
                <p className="text-sm font-medium">Temperatura</p>
                <span className="text-lg font-bold">{tempMatch[1]}</span>
              </Card>
            )}
            {humSueloMatch && (
              <Card className="p-3 flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <Droplets className="w-5 h-5 text-blue-600 mb-1" />
                <p className="text-sm font-medium">Humedad del Suelo</p>
                <span className="text-lg font-bold">{humSueloMatch[1]}</span>
              </Card>
            )}
            {humAireMatch && (
              <Card className="p-3 flex flex-col items-center bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
                <Wind className="w-5 h-5 text-cyan-600 mb-1" />
                <p className="text-sm font-medium">Humedad del Aire</p>
                <span className="text-lg font-bold">{humAireMatch[1]}</span>
              </Card>
            )}
            {estadoMatch && (
              <Card className="p-3 flex flex-col items-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <HeartPulse className="w-5 h-5 text-green-600 mb-1" />
                <p className="text-sm font-medium">Salud</p>
                <span className="text-sm font-bold">{estadoMatch[1]}</span>
                <span className="text-xs text-muted-foreground">{estadoMatch[2]}</span>
              </Card>
            )}
          </div>

          {resumen && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {resumen.trim()}
            </p>
          )}
        </div>
      )
    }

    // Si no hay formato especial → mostramos con negritas HTML
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^- /gm, "• ")

    return <div dangerouslySetInnerHTML={{ __html: formatted }} className="text-sm leading-relaxed" />
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
      {/* Efectos visuales */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-40 h-40 bg-chart-2/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-chart-3/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl shadow-lg relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-balance">Asistente IA</h2>
                {loading && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", loading ? "bg-chart-5 animate-pulse" : "bg-primary")} />
                {loading ? "Escribiendo..." : "Conectado"}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={clearChat}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                <Bot className="w-16 h-16 text-primary mx-auto relative" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-balance">¡Hola! Soy tu asistente de agricultura</h3>
              <p className="text-muted-foreground mb-6">Pregúntame sobre tus plantas, sensores o sistema de riego</p>

              <div className="flex flex-wrap gap-2 justify-center">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(suggestion)}
                    className={cn(
                      "rounded-full hover:scale-105 transition-all hover:shadow-lg",
                      "bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10",
                      "border-2 hover:border-primary/50",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 items-start animate-in fade-in slide-in-from-bottom-4 duration-500",
                message.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl shrink-0 shadow-sm",
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20"
                    : "bg-gradient-to-br from-muted to-accent ring-2 ring-border/50",
                )}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-primary" />
                ) : (
                  <Bot className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className={cn("flex-1 max-w-[80%]", message.role === "user" ? "items-end" : "items-start")}>
                <Card
                  className={cn(
                    "p-4 shadow-md hover:shadow-lg transition-shadow",
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20"
                      : "bg-card border-border/50",
                  )}
                >
                  {renderMessageContent(message)}
                </Card>
                <p className="text-xs text-muted-foreground mt-1.5 px-2">
                  {message.timestamp.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-start animate-in fade-in duration-300">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-muted to-accent ring-2 ring-border/50 shrink-0">
                <Bot className="w-5 h-5 text-muted-foreground" />
              </div>
              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Pensando...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/90 backdrop-blur-xl shadow-2xl p-4 relative z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="pr-4 h-12 border-2 focus:border-primary/50 bg-background/50"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-xl shadow-lg transition-all",
                "bg-gradient-to-br from-primary to-primary/80",
                "hover:scale-105 hover:shadow-xl hover:shadow-primary/30",
                "disabled:opacity-50 disabled:hover:scale-100",
              )}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
