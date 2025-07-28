import type React from "react"

import { useRef, useEffect } from "react"

interface DesktopContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onPersonalize: () => void
}

export function DesktopContextMenu({ x, y, onClose, onPersonalize }: DesktopContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

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

  const handleAction = (action: string) => {
    switch (action) {
      case "personalize":
        onPersonalize()
        break
      case "refresh":
        window.location.reload()
        break
      case "new-folder":
        console.log("Nouveau dossier")
        // TODO: Implémenter la création de dossier
        break
      case "paste":
        console.log("Coller")
        // TODO: Implémenter le collage
        break
      case "view":
        console.log("Options d'affichage")
        // TODO: Implémenter les options d'affichage
        break
      default:
        break
    }
    onClose()
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
      <button
        onClick={() => handleAction("view")}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
      >
        <span className="mr-3">👁️</span>
        Affichage
      </button>
      
      <button
        onClick={() => handleAction("refresh")}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
      >
        <span className="mr-3">🔄</span>
        Actualiser
      </button>

      <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

      <button
        onClick={() => handleAction("new-folder")}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
      >
        <span className="mr-3">📁</span>
        Nouveau dossier
      </button>

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