import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useFileStore } from "@/stores/file-store"
import { useWindowStore } from "@/stores/window-store"
import { fileService } from "@/services/file-service"

interface DesktopContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onPersonalize: () => void
}

export function DesktopContextMenu({ x, y, onClose, onPersonalize }: DesktopContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showViewSubmenu, setShowViewSubmenu] = useState(false)
  const [showNewSubmenu, setShowNewSubmenu] = useState(false)
  const { openWindow } = useWindowStore()
  const { refreshFiles } = useFileStore()

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

  const handleAction = async (action: string) => {
    switch (action) {
      case "personalize":
        onPersonalize()
        break
      case "refresh":
        await refreshFiles()
        break
      case "new-folder":
        await createNewFolder()
        break
      case "new-file":
        await createNewFile()
        break
      case "paste":
        console.log("Coller")
        // TODO: Implémenter le collage depuis le presse-papiers
        break
      case "view-large":
        console.log("Vue grandes icônes")
        // TODO: Implémenter le changement de taille des icônes
        break
      case "view-medium":
        console.log("Vue moyennes icônes")
        // TODO: Implémenter le changement de taille des icônes
        break
      case "view-small":
        console.log("Vue petites icônes")
        // TODO: Implémenter le changement de taille des icônes
        break
      case "view-list":
        console.log("Vue liste")
        // TODO: Implémenter le changement de vue
        break
      default:
        break
    }
    onClose()
  }

  const createNewFolder = async () => {
    try {
      const folderName = prompt("Nom du nouveau dossier:")
      if (!folderName || folderName.trim() === "") return

      await fileService.createFolderWithObject({
        name: folderName.trim(),
        path: "/",
        userId: 1
      })
      
      // Rafraîchir la liste des fichiers
      await refreshFiles()
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
      alert("Erreur lors de la création du dossier")
    }
  }

  const createNewFile = async () => {
    try {
      const fileName = prompt("Nom du nouveau fichier (avec extension):")
      if (!fileName || fileName.trim() === "") return

      await fileService.createFileWithObject({
        name: fileName.trim(),
        path: "/",
        content: "",
        userId: 1
      })
      
      // Rafraîchir la liste des fichiers
      await refreshFiles()
    } catch (error) {
      console.error('Erreur lors de la création du fichier:', error)
      alert("Erreur lors de la création du fichier")
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50 min-w-48"
      style={{
        left: x,
        top: y,
      }}
    >
      {/* Options d'affichage */}
      <div className="relative">
        <button
          onMouseEnter={() => setShowViewSubmenu(true)}
          onMouseLeave={() => setShowViewSubmenu(false)}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="mr-3">👁️</span>
            Affichage
          </div>
          <span className="text-xs">▶</span>
        </button>
        
        {showViewSubmenu && (
          <div 
            className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-40"
            onMouseEnter={() => setShowViewSubmenu(true)}
            onMouseLeave={() => setShowViewSubmenu(false)}
          >
            <button
              onClick={() => handleAction("view-large")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <span className="mr-3">🔍</span>
              Grandes icônes
            </button>
            <button
              onClick={() => handleAction("view-medium")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <span className="mr-3">📱</span>
              Moyennes icônes
            </button>
            <button
              onClick={() => handleAction("view-small")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <span className="mr-3">📱</span>
              Petites icônes
            </button>
            <button
              onClick={() => handleAction("view-list")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <span className="mr-3">📋</span>
              Liste
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={() => handleAction("refresh")}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
      >
        <span className="mr-3">🔄</span>
        Actualiser
      </button>

      <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

      {/* Nouveau */}
      <div className="relative">
        <button
          onMouseEnter={() => setShowNewSubmenu(true)}
          onMouseLeave={() => setShowNewSubmenu(false)}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="mr-3">➕</span>
            Nouveau
          </div>
          <span className="text-xs">▶</span>
        </button>
        
        {showNewSubmenu && (
          <div 
            className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-40"
            onMouseEnter={() => setShowNewSubmenu(true)}
            onMouseLeave={() => setShowNewSubmenu(false)}
          >
            <button
              onClick={() => handleAction("new-folder")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <span className="mr-3">📁</span>
              Dossier
            </button>
            <button
              onClick={() => handleAction("new-file")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <span className="mr-3">📄</span>
              Document texte
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

      <button
        onClick={() => handleAction("paste")}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-400"
        disabled
      >
        <span className="mr-3">📋</span>
        Coller
      </button>

      <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

      <button
        onClick={() => handleAction("personalize")}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
      >
        <span className="mr-3">🎨</span>
        Personnaliser
      </button>
    </div>
  )
} 