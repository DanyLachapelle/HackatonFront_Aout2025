import { useWindowStore } from "@/stores/window-store"
import { Button } from "@/components/ui/button"

export function WindowButtons() {
  const { windows, focusWindow, minimizeWindow, activeWindowId } = useWindowStore()

  if (windows.length === 0) {
    return null
  }

  return (
    <div className="flex space-x-1">
      {windows.filter(w => !w.isMinimized).map((window) => (
        <Button
          key={window.id}
          variant="ghost"
          className={`text-white hover:bg-white/10 h-8 px-3 text-xs ${
            activeWindowId === window.id ? "bg-white/20" : ""
          }`}
          onClick={() => focusWindow(window.id)}
        >
          {window.title}
        </Button>
      ))}
    </div>
  )
} 