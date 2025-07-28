import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MinusIcon, SquareIcon, XIcon } from "lucide-react"
import { useWindowStore } from "@/stores/window-store"
import type { WindowData } from "@/types/window-types"
import { cn } from "@/lib/utils"

// Import des vraies applications
import { Calculator } from "@/components/apps/calculator"
import { Clock } from "@/components/apps/clock"
import { Calendar } from "@/components/apps/calendar"
import { Settings } from "@/components/apps/settings"
import { Paint } from "@/components/apps/paint"
import { MusicPlayer } from "@/components/apps/music-player"
import { ImageGallery } from "@/components/apps/image-gallery"
import { TextEditor } from "@/components/apps/text-editor"
import { FileExplorer } from "@/components/apps/file-explorer"
import { Terminal } from "@/components/apps/terminal"

// Composants d'applications temporaires
function TemporaryApp({ type }: { type: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-4">
          {type === "file-explorer" ? "📁" : 
           type === "text-editor" ? "📝" : 
           type === "terminal" ? "💻" : 
           type === "file-viewer" ? "👁️" : "📱"}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {type === "file-explorer" ? "Explorateur de fichiers" : 
           type === "text-editor" ? "Éditeur de texte" : 
           type === "terminal" ? "Terminal" : 
           type === "file-viewer" ? "Visionneuse de fichiers" : "Application"}
        </h2>
        <p className="text-gray-600">Application en cours de développement</p>
      </div>
    </div>
  )
}

interface WindowProps {
  window: WindowData
}

export function Window({ window }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const { updateWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, activeWindowId } = useWindowStore()

  const isActive = activeWindowId === window.id

  // Logique de glisser-déposer existante...
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !window.isMaximized) {
      updateWindow(window.id, {
        position: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragOffset])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true)
      const rect = windowRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }
    focusWindow(window.id)
  }

  const handleDoubleClick = () => {
    maximizeWindow(window.id)
  }

  const renderContent = () => {
    switch (window.type) {
      case "calculator":
        return <Calculator />
      case "clock":
        return <Clock />
      case "calendar":
        return <Calendar />
      case "settings":
        return <Settings />
      case "paint":
        return <Paint />
      case "music-player":
        return <MusicPlayer />
      case "image-gallery":
        return <ImageGallery />
      case "text-editor":
        return <TextEditor />
      case "file-explorer":
        return <FileExplorer initialPath={window.initialPath} />
      case "terminal":
        return <Terminal initialPath={window.initialPath} />
      default:
        return <TemporaryApp type={window.type} />
    }
  }

  const windowStyle = window.isMaximized
    ? {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: isActive ? 1000 : 999,
      }
    : {
        position: "absolute" as const,
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: isActive ? 1000 : 999,
      }

  if (window.isMinimized) {
    return null
  }

  return (
    <Card
      ref={windowRef}
      className={cn(
        "flex flex-col overflow-hidden shadow-lg border",
        isActive ? "ring-2 ring-blue-500" : "",
        isDragging ? "cursor-grabbing" : ""
      )}
      style={windowStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Barre de titre */}
      <div
        ref={headerRef}
        className={cn(
          "flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b cursor-grab select-none",
          isDragging ? "cursor-grabbing" : ""
        )}
        onDoubleClick={handleDoubleClick}
      >
        <span className="font-medium text-sm truncate">{window.title}</span>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => minimizeWindow(window.id)}
          >
            <MinusIcon className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => maximizeWindow(window.id)}
          >
            <SquareIcon className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-500 hover:text-white"
            onClick={() => closeWindow(window.id)}
          >
            <XIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </Card>
  )
} 