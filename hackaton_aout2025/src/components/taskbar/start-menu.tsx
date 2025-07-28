import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWindowStore } from "@/stores/window-store"
import { 
  FolderIcon, 
  CalculatorIcon, 
  FileTextIcon, 
  ImageIcon, 
  TerminalIcon, 
  CalendarIcon, 
  ClockIcon, 
  PaletteIcon, 
  MusicIcon, 
  SettingsIcon 
} from "lucide-react"

interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { openWindow } = useWindowStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const handleOpenApp = (type: string, title: string, customSize?: { width: number; height: number }) => {
    const defaultSize = { width: 800, height: 600 }
    const size = customSize || defaultSize

    openWindow({
      id: `${type}-${Date.now()}`,
      title,
      type: type as any,
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      size,
      initialPath: type === "file-explorer" ? "/" : undefined,
    })
    onClose()
  }

  return (
    <Card ref={menuRef} className="absolute bottom-full left-0 mb-2 w-72 p-3">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-gray-500 mb-2 px-2">APPLICATIONS</div>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("file-explorer", "Explorateur de fichiers")}
        >
          <FolderIcon className="w-4 h-4 mr-3" />
          Explorateur de fichiers
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("calculator", "Calculatrice", { width: 320, height: 480 })}
        >
          <CalculatorIcon className="w-4 h-4 mr-3" />
          Calculatrice
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("text-editor", "Éditeur de texte", { width: 600, height: 400 })}
        >
          <FileTextIcon className="w-4 h-4 mr-3" />
          Éditeur de texte
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("image-gallery", "Galerie d'images")}
        >
          <ImageIcon className="w-4 h-4 mr-3" />
          Galerie d'images
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("terminal", "Terminal", { width: 700, height: 500 })}
        >
          <TerminalIcon className="w-4 h-4 mr-3" />
          Terminal
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("calendar", "Calendrier", { width: 600, height: 500 })}
        >
          <CalendarIcon className="w-4 h-4 mr-3" />
          Calendrier
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("clock", "Horloge", { width: 400, height: 300 })}
        >
          <ClockIcon className="w-4 h-4 mr-3" />
          Horloge
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("paint", "Paint", { width: 800, height: 600 })}
        >
          <PaletteIcon className="w-4 h-4 mr-3" />
          Paint
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("music-player", "Lecteur de musique", { width: 500, height: 400 })}
        >
          <MusicIcon className="w-4 h-4 mr-3" />
          Lecteur de musique
        </Button>

        <div className="border-t border-gray-200 dark:border-gray-600 my-2" />

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleOpenApp("settings", "Paramètres", { width: 700, height: 500 })}
        >
          <SettingsIcon className="w-4 h-4 mr-3" />
          Paramètres
        </Button>
      </div>
    </Card>
  )
} 