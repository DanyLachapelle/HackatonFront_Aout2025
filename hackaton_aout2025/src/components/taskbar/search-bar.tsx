import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchIcon, FolderIcon, FileIcon } from "lucide-react"
import { useWindowStore } from "@/stores/window-store"

interface SearchResult {
  id: string
  name: string
  type: string
  icon: string
  path?: string
  action: () => void
}

// Données d'exemple pour simuler un système de fichiers complet
const mockFileSystem: Record<string, any[]> = {
  "/": [
    {
      id: "1",
      name: "Documents",
      type: "folder",
      path: "/Documents",
    },
    {
      id: "2",
      name: "Images",
      type: "folder",
      path: "/Images",
    },
    {
      id: "3",
      name: "Musique",
      type: "folder",
      path: "/Musique",
    },
    {
      id: "4",
      name: "photo.jpg",
      type: "file",
      path: "/photo.jpg",
    },
    {
      id: "5",
      name: "rapport.txt",
      type: "file",
      path: "/rapport.txt",
    },
  ],
  "/Documents": [
    {
      id: "6",
      name: "Travail",
      type: "folder",
      path: "/Documents/Travail",
    },
    {
      id: "7",
      name: "Personnel",
      type: "folder",
      path: "/Documents/Personnel",
    },
    {
      id: "8",
      name: "projet.docx",
      type: "file",
      path: "/Documents/projet.docx",
    },
    {
      id: "9",
      name: "notes.txt",
      type: "file",
      path: "/Documents/notes.txt",
    },
  ],
  "/Images": [
    {
      id: "10",
      name: "vacances.jpg",
      type: "file",
      path: "/Images/vacances.jpg",
    },
    {
      id: "11",
      name: "screenshot.png",
      type: "file",
      path: "/Images/screenshot.png",
    },
  ],
  "/Musique": [
    {
      id: "12",
      name: "Playlist 1",
      type: "folder",
      path: "/Musique/Playlist 1",
    },
    {
      id: "13",
      name: "chanson.mp3",
      type: "file",
      path: "/Musique/chanson.mp3",
    },
  ],
  "/Documents/Travail": [
    {
      id: "14",
      name: "presentation.pptx",
      type: "file",
      path: "/Documents/Travail/presentation.pptx",
    },
  ],
  "/Documents/Personnel": [
    {
      id: "15",
      name: "budget.xlsx",
      type: "file",
      path: "/Documents/Personnel/budget.xlsx",
    },
  ],
  "/Musique/Playlist 1": [
    {
      id: "16",
      name: "titre1.mp3",
      type: "file",
      path: "/Musique/Playlist 1/titre1.mp3",
    },
    {
      id: "17",
      name: "titre2.mp3",
      type: "file",
      path: "/Musique/Playlist 1/titre2.mp3",
    },
  ],
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { openWindow } = useWindowStore()

  const searchableApps = [
    {
      id: "calculator",
      name: "Calculatrice",
      type: "Application",
      icon: "🧮",
      keywords: ["calc", "calculatrice", "math", "calcul"],
    },
    {
      id: "text-editor",
      name: "Éditeur de texte",
      type: "Application",
      icon: "📝",
      keywords: ["texte", "editeur", "notepad", "text"],
    },
    {
      id: "file-explorer",
      name: "Explorateur de fichiers",
      type: "Application",
      icon: "📁",
      keywords: ["fichier", "dossier", "explorer", "file"],
    },
    {
      id: "terminal",
      name: "Terminal",
      type: "Application",
      icon: "💻",
      keywords: ["terminal", "console", "cmd", "command"],
    },
    {
      id: "settings",
      name: "Paramètres",
      type: "Application",
      icon: "⚙️",
      keywords: ["parametre", "config", "settings", "preference"],
    },
    {
      id: "paint",
      name: "Paint",
      type: "Application",
      icon: "🎨",
      keywords: ["paint", "dessin", "image", "draw"],
    },
    {
      id: "image-gallery",
      name: "Galerie d'images",
      type: "Application",
      icon: "🖼️",
      keywords: ["image", "photo", "galerie", "gallery"],
    },
    {
      id: "calendar",
      name: "Calendrier",
      type: "Application",
      icon: "📅",
      keywords: ["calendrier", "calendar", "date", "agenda"],
    },
    {
      id: "clock",
      name: "Horloge",
      type: "Application",
      icon: "⏰",
      keywords: ["horloge", "clock", "time", "heure"],
    },
    {
      id: "music-player",
      name: "Lecteur de musique",
      type: "Application",
      icon: "🎵",
      keywords: ["musique", "music", "audio", "son"],
    },
  ]

  // Fonction pour rechercher dans tous les fichiers et dossiers
  const searchInFileSystem = (searchQuery: string): SearchResult[] => {
    const results: SearchResult[] = []
    const query = searchQuery.toLowerCase()

    // Parcourir tous les dossiers du système de fichiers
    Object.keys(mockFileSystem).forEach((folderPath) => {
      mockFileSystem[folderPath].forEach((item) => {
        if (item.name.toLowerCase().includes(query)) {
          results.push({
            id: item.id,
            name: item.name,
            type: item.type === "folder" ? "Dossier" : "Fichier",
            icon: item.type === "folder" ? "📁" : getFileIcon(item.name),
            path: item.path,
            action: () => {
              if (item.type === "folder") {
                // Ouvrir l'explorateur de fichiers dans ce dossier
                openWindow({
                  id: `explorer-${item.id}`,
                  title: `Explorateur - ${item.name}`,
                  type: "file-explorer",
                  initialPath: item.path,
                  position: { x: 100, y: 100 },
                  size: { width: 800, height: 600 },
                  isMinimized: false,
                  isMaximized: false,
                  zIndex: 1000,
                })
              } else {
                // Ouvrir le fichier avec l'application appropriée
                const extension = item.name.split('.').pop()?.toLowerCase()
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')
                const isTextFile = !isImage && extension !== 'mp3' && extension !== 'wav' && extension !== 'flac'
                
                if (isTextFile) {
                  // Ouvrir les fichiers texte dans l'éditeur
                  openWindow({
                    id: `editor-${item.id}`,
                    title: `${item.name} - Éditeur de texte`,
                    type: "text-editor",
                    filePath: item.path,
                    position: { x: 150, y: 150 },
                    size: { width: 800, height: 600 },
                    isMinimized: false,
                    isMaximized: false,
                    zIndex: 1000,
                  })
                } else if (isImage) {
                  // Ouvrir les images dans le visionneur
                  openWindow({
                    id: `viewer-${item.id}`,
                    title: item.name,
                    type: "file-viewer",
                    filePath: item.path,
                    position: { x: 150, y: 150 },
                    size: { width: 600, height: 400 },
                    isMinimized: false,
                    isMaximized: false,
                    zIndex: 1000,
                  })
                } else {
                  // Pour les autres types de fichiers, afficher un message
                  alert(`Ce type de fichier (.${extension}) n'est pas encore supporté pour l'édition.`)
                }
              }
              setQuery("")
              setIsOpen(false)
            },
          })
        }
      })
    })

    return results
  }

  // Fonction pour obtenir l'icône appropriée selon l'extension du fichier
  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'txt':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'ppt':
      case 'pptx':
        return '📈'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return '🖼️'
      case 'mp3':
      case 'wav':
      case 'flac':
        return '🎵'
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎬'
      case 'pdf':
        return '📕'
      case 'zip':
      case 'rar':
        return '📦'
      default:
        return '📄'
    }
  }

  useEffect(() => {
    if (query.length > 0) {
      // Rechercher dans les applications
      const appResults = searchableApps
        .filter(
          (app) =>
            app.keywords.some((keyword) => keyword.toLowerCase().includes(query.toLowerCase())) ||
            app.name.toLowerCase().includes(query.toLowerCase()),
        )
        .map((app) => ({
          id: app.id,
          name: app.name,
          type: app.type,
          icon: app.icon,
          action: () => {
            const appSizes = {
              calculator: { width: 320, height: 480 },
              "text-editor": { width: 800, height: 600 },
              "file-explorer": { width: 800, height: 600 },
              terminal: { width: 700, height: 500 },
              settings: { width: 900, height: 700 },
              paint: { width: 800, height: 600 },
              "image-gallery": { width: 800, height: 600 },
              calendar: { width: 800, height: 650 },
              clock: { width: 600, height: 550 },
              "music-player": { width: 500, height: 400 },
            }

            openWindow({
              id: `${app.id}-${Date.now()}`,
              title: app.name,
              type: app.id as any,
              position: { x: 100, y: 100 },
              size: appSizes[app.id as keyof typeof appSizes] || { width: 600, height: 400 },
              isMinimized: false,
              isMaximized: false,
              zIndex: 1000,
            })
            setQuery("")
            setIsOpen(false)
          },
        }))

      // Rechercher dans les fichiers et dossiers
      const fileResults = searchInFileSystem(query)

      // Combiner et limiter les résultats
      const allResults = [...appResults, ...fileResults].slice(0, 10)
      setResults(allResults)
      setIsOpen(allResults.length > 0)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, openWindow])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      setQuery("")
      inputRef.current?.blur()
    } else if (e.key === "Enter" && results.length > 0) {
      results[0].action()
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher applications, fichiers, dossiers..."
          className="w-64 pl-8 h-8 bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute bottom-full mb-1 w-full z-50 max-h-64 overflow-y-auto">
          <div className="p-1">
            {results.map((result) => (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={result.action}
              >
                <span className="mr-3 text-lg">{result.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-medium">{result.name}</div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>{result.type}</span>
                    {result.path && (
                      <span className="text-gray-400 truncate ml-2">{result.path}</span>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
} 