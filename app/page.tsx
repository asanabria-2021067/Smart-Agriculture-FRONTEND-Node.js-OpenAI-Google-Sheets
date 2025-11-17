"use client"

import { useState } from "react"
import { Leaf, Activity, Settings, TrendingUp, MessageCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import Plants from "@/components/plants"
import Dashboard from "@/components/dashboard"
import Chat from "@/components/chat"
import Controls from "@/components/controls"
import Analysis from "@/components/analysis"

type Tab = "plants" | "dashboard" | "chat" | "controls" | "analysis"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("plants")

  return (
    <main className="min-h-screen flex flex-col pb-20">
      {/* Content */}
      <div className="flex-1">
        {activeTab === "plants" && <Plants />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "chat" && <Chat />}
        {activeTab === "controls" && <Controls />}
        {activeTab === "analysis" && <Analysis />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-lg bg-opacity-90 z-50">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex items-center justify-around h-16">
            <button
              onClick={() => setActiveTab("plants")}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                activeTab === "plants" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Leaf className="w-5 h-5" />
              <span className="text-xs font-medium">Plantas</span>
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                activeTab === "dashboard" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("analysis")}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                activeTab === "analysis" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-medium">Análisis</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                activeTab === "chat" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-medium">Chat</span>
            </button>

            <button
              onClick={() => setActiveTab("controls")}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                activeTab === "controls" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Controles</span>
            </button>
          </div>
        </div>
      </nav>
    </main>
  )
}
