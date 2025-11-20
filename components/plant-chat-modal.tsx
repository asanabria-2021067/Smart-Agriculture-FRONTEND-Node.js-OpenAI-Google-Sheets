"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, Trash2, Loader2, X, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { API_CONFIG, getMacetaApiUrl, apiRequest } from "@/lib/config"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface PlantChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  macetaId: number
  plantName: string
  plantEmoji: string
}

const quickSuggestions = [
  "¿Cómo estás?",
  "¿Necesitas agua?",
  "Cuéntame sobre ti",
  "¿Qué tal el clima?"
]

export default function PlantChatModal({
  open,
  onOpenChange,
  macetaId,
  plantName,
  plantEmoji,
}: PlantChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open) {
      loadHistory()
    }
  }, [open, macetaId])

  const loadHistory = async () => {
    try {
      setError(null)
      
      // ✅ FIX: Usar la ruta correcta del backend
      // El backend espera: /api/chat/maceta/:id/history
      const url = `/api/chat/maceta/${macetaId}/history?limit=20`
      const response = await apiRequest(url)
      
      console.log('📜 Chat history response:', response)
      
      if (response.success && response.messages) {
        // Convertir los mensajes del backend al formato del frontend
        const formattedMessages: Message[] = []
        
        response.messages.forEach((msg: any) => {
          // Agregar mensaje del usuario
          formattedMessages.push({
            id: msg.id,
            role: "user",
            content: msg.userMessage,
            timestamp: new Date(msg.timestamp)
          })
          
          // Agregar respuesta del bot
          formattedMessages.push({
            id: msg.id + "-bot",
            role: "assistant",
            content: msg.botResponse,
            timestamp: new Date(new Date(msg.timestamp).getTime() + 1000)
          })
        })
        
        // Ordenar por timestamp
        formattedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("❌ Error loading history:", error)
    }
  }

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
    setError(null)

    try {
      // ✅ FIX: Usar la ruta correcta del backend
      // El backend espera: POST /api/chat/maceta/:id/message
      const url = `/api/chat/maceta/${macetaId}/message`
      const response = await apiRequest(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      console.log('💬 Chat response:', response)

      if (response.success && response.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(response.error || 'No se recibió respuesta')
      }
    } catch (error) {
      console.error("❌ Error sending message:", error)
      setError(error instanceof Error ? error.message : "Error de conexión")
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, no pude conectar con el backend. ¿Está corriendo en localhost:3000?",
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
      // ✅ FIX: Usar la ruta correcta del backend
      // El backend espera: DELETE /api/chat/maceta/:id/clear
      const url = `/api/chat/maceta/${macetaId}/clear`
      await apiRequest(url, { method: "DELETE" })
      
      setMessages([])
      setError(null)
    } catch (error) {
      console.error("❌ Error clearing chat:", error)
      // Limpiar localmente aunque falle
      setMessages([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <DialogTitle>Chat con {plantName}</DialogTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <span className={cn("w-2 h-2 rounded-full", loading ? "bg-chart-5 animate-pulse" : error ? "bg-destructive" : "bg-primary")} />
                  {loading ? "Escribiendo..." : error ? "Error de conexión" : "En línea"}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive"
                onClick={clearChat}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="px-4 pt-2">
            <Card className="p-3 bg-destructive/10 border-destructive/20">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-destructive">No se pudo enviar el mensaje. Verifica la conexión.</p>
              </div>
            </Card>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🌱</div>
              <h3 className="text-lg font-semibold mb-2">¡Hola! Soy {plantName}</h3>
              <p className="text-muted-foreground text-sm mb-4">Pregúntame lo que quieras</p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {quickSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-full"
                    disabled={loading}
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
                "flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0",
                  message.role === "user"
                    ? "bg-primary/20"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <span className="text-lg">🌱</span>
                )}
              </div>

              <Card
                className={cn(
                  "p-3 max-w-[75%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <span className="text-lg">🌱</span>
              </div>
              <Card className="p-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-accent/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Escribe a ${plantName}...`}
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}