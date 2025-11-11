"use client"

import { useState } from "react"
import { MessageCircle, Activity, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import Dashboard from "@/components/dashboard"
import Chat from "@/components/chat"
import Controls from "@/components/controls"

type Tab = "dashboard" | "chat" | "controls"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  return (
    <main className="min-h-screen flex flex-col pb-20">
      {/* Content */}
      <div className="flex-1">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "chat" && <Chat />}
        {activeTab === "controls" && <Controls />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all",
                activeTab === "dashboard" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Activity className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all",
                activeTab === "chat" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-medium">Chat</span>
            </button>

            <button
              onClick={() => setActiveTab("controls")}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all",
                activeTab === "controls" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs font-medium">Controles</span>
            </button>
          </div>
        </div>
      </nav>
    </main>
  )
}
