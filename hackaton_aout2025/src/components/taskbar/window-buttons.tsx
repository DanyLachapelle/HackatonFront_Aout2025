import { useWindowStore } from "@/stores/window-store"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"

export function WindowButtons() {
  const { windows, focusWindow, minimizeWindow, activeWindowId, closeWindow } = useWindowStore()
  const [hoveredWindow, setHoveredWindow] = useState<string | null>(null)

  if (windows.length === 0) {
    return null
  }

  const getWindowIcon = (windowType: string) => {
    const icons: Record<string, string> = {
      calculator: "🧮",
      "text-editor": "📝",
      "file-explorer": "📁",
      "image-gallery": "📱",
      terminal: "💻",
      calendar: "📅",
      clock: "⏰",
      paint: "🎨",
      "music-player": "🎧",
      settings: "⚙️",
      "file-viewer": "👁️",
    }
    return icons[windowType] || "📱"
  }

  const handleWindowClick = (windowId: string, isMinimized: boolean) => {
    if (isMinimized) {
      // Si la fenêtre est minimisée, la restaurer et la mettre au premier plan
      focusWindow(windowId)
    } else if (activeWindowId === windowId) {
      // Si la fenêtre est déjà active, la minimiser (toggle behavior)
      minimizeWindow(windowId)
    } else {
      // Si la fenêtre n'est pas active, la mettre au premier plan
      focusWindow(windowId)
    }
  }

  const handleCloseClick = (e: React.MouseEvent, windowId: string) => {
    e.stopPropagation() // Empêcher le clic de déclencher handleWindowClick
    closeWindow(windowId)
  }

  return (
    <div className="flex space-x-1">
      {windows.map((window) => (
        <div 
          key={window.id}
          className="relative"
          onMouseEnter={() => setHoveredWindow(window.id)}
          onMouseLeave={() => setHoveredWindow(null)}
        >
          <Button
            variant="ghost"
            className={`text-white hover:bg-white/10 h-8 px-3 text-xs flex items-center gap-1 ${
              activeWindowId === window.id ? "bg-white/20" : ""
            } ${window.isMinimized ? "opacity-60" : ""} ${
              hoveredWindow === window.id ? "pr-6" : ""
            }`}
            onClick={() => handleWindowClick(window.id, window.isMinimized)}
            title={window.isMinimized ? `Restaurer ${window.title}` : window.title}
          >
            <span className="text-sm">{getWindowIcon(window.type)}</span>
            <span className="truncate max-w-20">{window.title}</span>
          </Button>
          
          {/* Bouton de fermeture au survol */}
          {hoveredWindow === window.id && (
            <button
              onClick={(e) => handleCloseClick(e, window.id)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-all"
              title={`Fermer ${window.title}`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
} 