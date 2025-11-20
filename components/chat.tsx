"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, Trash2, Loader2, Sparkles, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_CONFIG, getApiUrl } from "@/lib/config"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const quickSuggestions = ["¿Cómo está mi planta 1?", "Muestra estadísticas", "¿Necesita agua alguna de mis plantas?", "Datos de hoy"]

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsSpeaking(false)
  }

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
        console.error("Error al reproducir audio")
        audioRef.current = null
      }

      await audio.play()
    } catch (error) {
      console.error("Error en text-to-speech:", error)
      setIsSpeaking(false)
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
      const responseText = data.message || "Lo siento, no pude procesar tu mensaje."

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Reproducir la respuesta con voz
      await textToSpeech(responseText)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje. ¿Está el backend corriendo en localhost:3000?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      
      if (audioEnabled) {
        await textToSpeech(errorMessage.content)
      }
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
      stopAudio()
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

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    if (audioEnabled) {
      stopAudio()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Asistente IA</h2>
                {loading && <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />}
                {isSpeaking && <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span
                  className={cn("w-2 h-2 rounded-full", loading ? "bg-amber-500 animate-pulse" : isSpeaking ? "bg-green-500 animate-pulse" : "bg-emerald-500")}
                />
                {loading ? "Pensando..." : isSpeaking ? "Hablando..." : "En línea"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors rounded-xl",
                audioEnabled ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
              )}
              onClick={toggleAudio}
              title={audioEnabled ? "Desactivar voz" : "Activar voz"}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-xl"
                onClick={clearChat}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-2xl">
                  <Bot className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 text-balance">
                ¡Hola! Soy tu asistente de agricultura
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">
                Pregúntame sobre tus plantas, sensores o sistema de riego
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mb-8 flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4" />
                Mis respuestas se reproducirán con voz
              </p>

              <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                {quickSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    onClick={() => sendMessage(suggestion)}
                    className={cn(
                      "rounded-full hover:scale-105 transition-all hover:shadow-md",
                      "border-2 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700",
                      "hover:border-green-300 dark:hover:border-green-600 font-medium cursor-pointer",
                    )}
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
                "flex gap-4 items-end animate-in fade-in slide-in-from-bottom-3 duration-500",
                message.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div
                className={cn(
                  "shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md",
                  message.role === "user"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600",
                )}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                )}
              </div>
              <div
                className={cn("flex flex-col gap-1 max-w-[75%]", message.role === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "px-5 py-3.5 rounded-2xl shadow-sm",
                    message.role === "user"
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-md"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-700",
                  )}
                >
                  <p className="text-[15px] leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 px-2">
                  {message.timestamp.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 items-end animate-in fade-in duration-300">
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 shadow-md">
                <Bot className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Escribiendo</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={loading}
                className="h-14 pl-6 pr-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 bg-slate-50 dark:bg-slate-800 text-base shadow-sm transition-all"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className={cn(
                "h-14 w-14 rounded-2xl shadow-lg transition-all",
                "bg-gradient-to-br from-green-500 to-green-600",
                "hover:from-green-600 hover:to-green-700",
                "hover:scale-105 hover:shadow-xl cursor-pointer",
                "disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Send className="w-6 h-6 text-white" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}