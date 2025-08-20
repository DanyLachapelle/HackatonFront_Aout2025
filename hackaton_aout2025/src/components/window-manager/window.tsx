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

import { Paint } from "@/components/apps/paint"
import { MusicPlayer } from "@/components/apps/music-player"
import { ImageGallery } from "@/components/apps/image-gallery"
import { TextEditor } from "@/components/apps/text-editor"
import { FileExplorer } from "@/components/apps/file-explorer"
import { Terminal } from "@/components/apps/terminal"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { MiniMusicPlayer } from "@/components/apps/mini-music-player"

// Composant pour afficher les fichiers
function FileViewerWindow({ filePath, windowId }: { filePath?: string; windowId: string }) {
  const [file, setFile] = useState<{
    name: string
    type: 'text' | 'image' | 'folder' | 'pdf'
    content?: string
    url?: string
    size?: number
    lastModified?: Date
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const { closeWindow } = useWindowStore()

  useEffect(() => {
    const loadFile = async () => {
      if (filePath) {
        setLoading(true)
        try {
          const fileName = filePath.split('/').pop() || 'fichier'
          const extension = fileName.split('.').pop()?.toLowerCase()
          
          let fileType: 'text' | 'image' | 'folder' | 'pdf' = 'text'
          let content = ''
          let url = ''
          
          const isImage = ['jpg','jpeg','png','gif','webp','bmp','svg','tiff'].includes(extension || '')
          const isPdf = extension === 'pdf'
          const isText = ['txt','md','json','js','ts','html','css','log','rtf'].includes(extension || '')

          if (isImage) {
            fileType = 'image'
            url = `http://localhost:8080/api/v2/files/download?path=${encodeURIComponent(filePath)}&userId=1&inline=true`
          } else if (isPdf) {
            fileType = 'pdf'
            url = `http://localhost:8080/api/v2/files/download?path=${encodeURIComponent(filePath)}&userId=1&inline=true`
          } else if (isText) {
            fileType = 'text'
            // Charger le contenu du fichier depuis le backend
            try {
              const response = await fetch(`http://localhost:8080/api/v2/files/files/content?path=${encodeURIComponent(filePath)}&userId=1`)
              if (response.ok) {
                content = await response.text()
              } else {
                content = `Erreur lors du chargement du fichier ${fileName}`
              }
            } catch (error) {
              content = `Erreur lors du chargement du fichier ${fileName}: ${error}`
            }
          }
          
          setFile({
            name: fileName,
            type: fileType,
            content,
            url,
            size: 0, // TODO: Récupérer la vraie taille depuis le backend
            lastModified: new Date() // TODO: Récupérer la vraie date depuis le backend
          })
        } catch (error) {
          console.error('Erreur lors du chargement du fichier:', error)
          setFile({
            name: 'Erreur',
            type: 'text',
            content: `Erreur lors du chargement du fichier: ${error}`,
            size: 0,
            lastModified: new Date()
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadFile()
  }, [filePath])

  if (loading || !file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-600">Chargement du fichier...</p>
          {loading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Version adaptée du FileViewer pour les fenêtres
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* En-tête simplifié */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
          <span className="text-lg">
            {file.type === 'text' ? '📄' : file.type === 'image' ? '🖼️' : file.type === 'pdf' ? '📄' : '📁'}
          </span>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{file.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {file.type === 'text' ? 'Fichier texte' : file.type === 'image' ? 'Image' : file.type === 'pdf' ? 'Document PDF' : 'Dossier'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {file.size && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => closeWindow(windowId)}
            className="p-2"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-4">
        {file.type === 'text' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full">
            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
              {file.content}
            </pre>
          </div>
        )}
        {file.type === 'image' && (
          <div className="flex items-center justify-center h-full">
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
        {file.type === 'pdf' && (
          <div className="w-full h-full">
            <iframe
              title={file.name}
              src={file.url}
              className="w-full h-full border-0"
            />
          </div>
        )}
        {file.type === 'folder' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-600 dark:text-gray-400">
                Ceci est un dossier
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Utilisez l'explorateur de fichiers pour naviguer
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Barre de statut */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Type: {file.type}</span>
          {file.lastModified && (
            <span>
              Modifié: {file.lastModified.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

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
    // Empêcher la maximisation pour la calculatrice
    if (window.type !== "calculator") {
      maximizeWindow(window.id)
    }
  }

  // Gestion du clic sur la fenêtre pour la mettre en arrière-plan
  const handleWindowClick = (e: React.MouseEvent) => {
    // Si on clique sur la fenêtre elle-même (pas sur les boutons), la mettre en arrière-plan
    if (e.target === windowRef.current || windowRef.current?.contains(e.target as Node)) {
      // Vérifier si on n'a pas cliqué sur un bouton
      const target = e.target as HTMLElement
      if (target.closest('button')) {
        return // Ne rien faire si on a cliqué sur un bouton
      }
      
      // Trouver une autre fenêtre active ou ne rien faire
      const { windows } = useWindowStore.getState()
      const otherWindows = windows.filter(w => w.id !== window.id && !w.isMinimized)
      if (otherWindows.length > 0) {
        focusWindow(otherWindows[0].id)
      }
    }
  }

  const renderContent = () => {
    switch (window.type) {
      case "calculator":
        return <Calculator windowId={window.id} />
      case "clock":
        return <Clock windowId={window.id} />
      case "calendar":
        return <Calendar />
      case "settings":
        return <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <div className="text-lg font-medium">Personnaliser le bureau</div>
            <div className="text-sm">Utilisez le bouton dans la barre des tâches</div>
          </div>
        </div>
      case "paint":
        return <Paint windowId={window.id} />
      case "music-player":
        return <MusicPlayer windowId={window.id} />
      case "image-gallery":
        return <ImageGallery />
      case "text-editor":
        return <TextEditor windowId={window.id} filePath={window.filePath} />
      case "file-explorer":
        return <FileExplorer initialPath={window.initialPath} />
      case "file-viewer":
        return <FileViewerWindow filePath={window.filePath} windowId={window.id} />
      case "mini-music-player":
        return <MiniMusicPlayer windowId={window.id} filePath={window.filePath} fileName={window.title} />
      case "terminal":
        return <Terminal initialPath={window.initialPath} windowId={window.id} />
      default:
        return <TemporaryApp type={window.type} />
    }
  }

  // Empêcher la maximisation pour la calculatrice
  const isCalculator = window.type === "calculator"
  const effectiveIsMaximized = isCalculator ? false : window.isMaximized

  const windowStyle = effectiveIsMaximized
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
    return (
      <Card
        ref={windowRef}
        className={cn(
          "flex flex-col overflow-hidden shadow-lg border",
          isActive ? "ring-2 ring-blue-500" : "",
          isDragging ? "cursor-grabbing" : "",
          isCalculator ? "resize-none" : ""
        )}
        style={{
          ...windowStyle,
          display: "none" // Masquer complètement la fenêtre minimisée
        }}
        onMouseDown={handleMouseDown}
        onClick={handleWindowClick}
      >
        {/* Barre de titre */}
        <div
          ref={headerRef}
          className={cn(
            "flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b select-none",
            "cursor-grab",
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
            {!isCalculator && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => maximizeWindow(window.id)}
              >
                <SquareIcon className="w-3 h-3" />
              </Button>
            )}
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

  return (
    <Card
      ref={windowRef}
      className={cn(
        "flex flex-col overflow-hidden shadow-lg border",
        isActive ? "ring-2 ring-blue-500" : "",
        isDragging ? "cursor-grabbing" : "",
        // Empêcher le redimensionnement pour la calculatrice
        isCalculator ? "resize-none" : ""
      )}
      style={windowStyle}
      onMouseDown={handleMouseDown}
      onClick={handleWindowClick}
    >
      {/* Barre de titre */}
      <div
        ref={headerRef}
        className={cn(
          "flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b select-none",
          "cursor-grab",
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
          {/* Masquer le bouton de maximisation pour la calculatrice */}
          {!isCalculator && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => maximizeWindow(window.id)}
            >
              <SquareIcon className="w-3 h-3" />
            </Button>
          )}
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