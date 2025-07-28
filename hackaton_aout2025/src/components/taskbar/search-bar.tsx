import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { useWindowStore } from "@/stores/window-store"

interface SearchResult {
  id: string
  name: string
  type: string
  icon: string
  action: () => void
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

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchableApps
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
              "text-editor": { width: 600, height: 400 },
              "file-explorer": { width: 800, height: 600 },
              terminal: { width: 700, height: 500 },
              settings: { width: 700, height: 500 },
              paint: { width: 800, height: 600 },
              "image-gallery": { width: 800, height: 600 },
              calendar: { width: 600, height: 500 },
              clock: { width: 400, height: 300 },
              "music-player": { width: 500, height: 400 },
            }

            openWindow({
              id: `${app.id}-${Date.now()}`,
              title: app.name,
              type: app.id as any,
              position: { x: 100, y: 100 },
              size: appSizes[app.id as keyof typeof appSizes] || { width: 600, height: 400 },
            })
            setQuery("")
            setIsOpen(false)
          },
        }))

      setResults(filtered)
      setIsOpen(filtered.length > 0)
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
          placeholder="Rechercher..."
          className="w-64 pl-8 h-8 bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full mt-1 w-full z-50 max-h-64 overflow-y-auto">
          <div className="p-1">
            {results.map((result) => (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={result.action}
              >
                <span className="mr-3 text-lg">{result.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{result.name}</div>
                  <div className="text-xs text-gray-500">{result.type}</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
} 