import { useWindowStore } from "@/stores/window-store"
import { Button } from "@/components/ui/button"

export function WindowButtons() {
  const { windows, focusWindow, minimizeWindow, activeWindowId } = useWindowStore()

  if (windows.length === 0) {
    return null
  }

  const getWindowIcon = (windowType: string) => {
    const icons: Record<string, string> = {
      calculator: "🧮",
      "text-editor": "📝",
      "file-explorer": "📁",
      "image-gallery": "🖼️",
      terminal: "💻",
      calendar: "📅",
      clock: "⏰",
      paint: "🎨",
      "music-player": "🎵",
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
      // Si la fenêtre est déjà active, la mettre en arrière-plan
      const otherWindows = windows.filter(w => w.id !== windowId && !w.isMinimized)
      if (otherWindows.length > 0) {
        focusWindow(otherWindows[0].id)
      }
    } else {
      // Si la fenêtre n'est pas active, la mettre au premier plan
      focusWindow(windowId)
    }
  }

  return (
    <div className="flex space-x-1">
      {windows.map((window) => (
        <Button
          key={window.id}
          variant="ghost"
          className={`text-white hover:bg-white/10 h-8 px-3 text-xs flex items-center gap-1 ${
            activeWindowId === window.id ? "bg-white/20" : ""
          } ${window.isMinimized ? "opacity-60" : ""}`}
          onClick={() => handleWindowClick(window.id, window.isMinimized)}
          title={window.isMinimized ? `Restaurer ${window.title}` : window.title}
        >
          <span className="text-sm">{getWindowIcon(window.type)}</span>
          <span className="truncate max-w-20">{window.title}</span>
        </Button>
      ))}
    </div>
  )
} 