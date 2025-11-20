"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Trash2, Loader2, AlertCircle, Volume2, VolumeX } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/lib/config"

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

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""

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

  // AUDIO STATES
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open) loadHistory()
  }, [open, macetaId])

  // --------------------------
  // 🎤 STOP AUDIO
  // --------------------------
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsSpeaking(false)
  }

  // --------------------------
  // 🔊 TEXT TO SPEECH
  // --------------------------
  const textToSpeech = async (text: string) => {
    if (!audioEnabled) return

    try {
      stopAudio()
      setIsSpeaking(true)

      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "nova",
          speed: 1.0,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error en TTS: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        audioRef.current = null
      }

      await audio.play()
    } catch (err) {
      console.error("Error en text-to-speech:", err)
      setIsSpeaking(false)
    }
  }

  // --------------------------
  // 📜 LOAD HISTORY
  // --------------------------
  const loadHistory = async () => {
    try {
      setError(null)
      const url = `/api/chat/maceta/${macetaId}/history?limit=20`
      const response = await apiRequest(url)

      if (response.success && response.messages) {
        const formatted: Message[] = []

        response.messages.forEach((msg: any) => {
          formatted.push({
            id: msg.id,
            role: "user",
            content: msg.userMessage,
            timestamp: new Date(msg.timestamp)
          })

          formatted.push({
            id: msg.id + "-bot",
            role: "assistant",
            content: msg.botResponse,
            timestamp: new Date(new Date(msg.timestamp).getTime() + 1000)
          })
        })

        formatted.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

        setMessages(formatted)
      }
    } catch (err) {
      console.error("Error loading history:", err)
    }
  }

  // --------------------------
  // 💬 SEND MESSAGE
  // --------------------------
  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const url = `/api/chat/maceta/${macetaId}/message`
      const response = await apiRequest(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      if (response.success && response.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage])

        // 🔊 Reproducir respuesta
        await textToSpeech(response.message)
      } else {
        throw new Error(response.error || "No se recibió respuesta")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("No se pudo conectar con el backend.")

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, no pude conectar con el backend. ¿Está corriendo?",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])

      if (audioEnabled) await textToSpeech(errorMessage.content)
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
      const url = `/api/chat/maceta/${macetaId}/clear`
      await apiRequest(url, { method: "DELETE" })

      setMessages([])
      setError(null)
    } catch (err) {
      console.error("Error clearing chat:", err)
      setMessages([])
    }
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    if (audioEnabled) stopAudio()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">

        {/* HEADER */}
        <DialogHeader className="p-4 border-b bg-accent/20">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <DialogTitle>Chat con {plantName}</DialogTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <span className={cn("w-2 h-2 rounded-full",
                    loading ? "bg-yellow-500 animate-pulse" :
                    isSpeaking ? "bg-green-500 animate-pulse" :
                    "bg-primary")} />

                  {loading
                    ? "Escribiendo..."
                    : isSpeaking
                    ? "Hablando..."
                    : "En línea"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {/* AUDIO TOGGLE */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAudio}
                title={audioEnabled ? "Desactivar voz" : "Activar voz"}
              >
                {audioEnabled ? <Volume2 /> : <VolumeX />}
              </Button>

              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

          </div>
        </DialogHeader>

        {/* ERROR */}
        {error && (
          <div className="px-4 pt-2">
            <Card className="p-3 bg-destructive/10">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            </Card>
          </div>
        )}

        {/* MESSAGES */}
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
                    disabled={loading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 items-start",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                msg.role === "user" ? "bg-primary/20" : "bg-muted"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <span className="text-lg">🌱</span>}
              </div>

              <Card className={cn(
                "p-3 max-w-[75%]",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
              )}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
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

        {/* INPUT */}
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
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  )
}
