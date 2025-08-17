import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useFileStore } from "@/stores/file-store"
import { useWindowStore } from "@/stores/window-store"
import { useDesktopStore } from "@/stores/desktop-store"
import { fileService } from "@/services/file-service"
import { cn } from "@/lib/utils"
import { useCustomAlert, CustomAlert } from "@/components/ui/custom-alert"

interface DesktopContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onPersonalize: () => void
  selectedItem?: FileItem | null
}

export function DesktopContextMenu({ x, y, onClose, onPersonalize, selectedItem }: DesktopContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showViewSubmenu, setShowViewSubmenu] = useState(false)
  const [showNewSubmenu, setShowNewSubmenu] = useState(false)
  const { openWindow } = useWindowStore()
  const { refreshFiles } = useFileStore()
  const { refreshDesktopFiles, setIconSize, iconSize, reorganizeIcons } = useDesktopStore()
  const { showError, showSuccess, alert, hideAlert } = useCustomAlert()

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
        try {
          // Créer un input file caché pour permettre la sélection de fichiers
          const input = document.createElement('input')
          input.type = 'file'
          input.multiple = true
          input.style.display = 'none'
          
          // Ajouter l'input au DOM
          document.body.appendChild(input)
          
          // Écouter les changements
          input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files
            if (files && files.length > 0) {
              try {
                // Upload chaque fichier vers le dossier Bureau
                for (let i = 0; i < files.length; i++) {
                  await fileService.uploadFile('/bureau', files[i])
                }
                
                // Rafraîchir le bureau
                await refreshDesktopFiles()
                console.log(`${files.length} fichier(s) ajouté(s) au bureau`)
              } catch (error) {
                console.error("Erreur lors de l'upload:", error)
                let errorMessage = "Erreur lors de l'ajout des fichiers"
                
                if (error instanceof Error) {
                  if (error.message.includes("Type de fichier non autorisé")) {
                    errorMessage = "Certains fichiers ne sont pas autorisés sur le bureau.\n\nTypes autorisés : Tous les types de fichiers"
                  } else if (error.message.includes("existe déjà")) {
                    errorMessage = "Un fichier avec ce nom existe déjà sur le bureau.\n\nVeuillez renommer le fichier ou le supprimer d'abord."
                  } else if (error.message.includes("Taille de fichier")) {
                    errorMessage = "Un fichier est trop volumineux.\n\nTaille maximale : 10 MB"
                  } else {
                    errorMessage = error.message
                  }
                }
                
                showError("Erreur d'ajout", errorMessage)
              }
            }
            
            // Nettoyer l'input
            document.body.removeChild(input)
          }
          
          // Déclencher la sélection de fichiers
          input.click()
          
        } catch (error) {
          console.error("Erreur lors du collage:", error)
          showError("Erreur de collage", "Impossible de coller les fichiers. Veuillez réessayer.")
        }
        break
      case "view-large":
        console.log("Vue grandes icônes")
        setIconSize("large")
        reorganizeIcons()
        break
      case "view-medium":
        console.log("Vue moyennes icônes")
        setIconSize("medium")
        reorganizeIcons()
        break
      case "view-small":
        console.log("Vue petites icônes")
        setIconSize("small")
        reorganizeIcons()
        break
             case "view-list":
         console.log("Vue liste")
         // TODO: Implémenter le changement de vue
         break
       case "delete":
         if (selectedItem) {
           await deleteSelectedItem(selectedItem)
         }
         break
       case "rename":
         if (selectedItem) {
           await renameSelectedItem(selectedItem)
         }
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
        path: "/bureau",
        userId: 1
      })
      
      // Rafraîchir la liste des fichiers et le bureau
      await refreshFiles()
      await refreshDesktopFiles()
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
      showError("Erreur de création", "Impossible de créer le dossier. Veuillez réessayer.")
    }
  }

  const createNewFile = async () => {
    try {
      const fileName = prompt("Nom du nouveau fichier:")
      if (!fileName || fileName.trim() === "") return

      // Forcer l'extension .txt si elle n'est pas présente
      let finalFileName = fileName.trim()
      if (!finalFileName.toLowerCase().endsWith('.txt')) {
        finalFileName += '.txt'
      }

      await fileService.createFileWithObject({
        name: finalFileName,
        path: "/bureau",
        content: "",
        userId: 1
      })
      
      // Rafraîchir la liste des fichiers et le bureau
      await refreshFiles()
      await refreshDesktopFiles()
    } catch (error) {
      console.error('Erreur lors de la création du fichier:', error)
      showError("Erreur de création", "Impossible de créer le fichier. Veuillez réessayer.")
    }
  }

  const deleteSelectedItem = async (item: FileItem) => {
    try {
      const confirmMessage = `Êtes-vous sûr de vouloir supprimer "${item.name}" ?`
      if (!confirm(confirmMessage)) return

      if (item.type === "folder") {
        await fileService.deleteFolder(item.id)
      } else {
        await fileService.deleteFileById(item.id)
      }
      
      // Rafraîchir la liste des fichiers et le bureau
      await refreshFiles()
      await refreshDesktopFiles()
      console.log(`Élément "${item.name}" supprimé avec succès`)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showError("Erreur de suppression", "Impossible de supprimer l'élément. Veuillez réessayer.")
    }
  }

  const renameSelectedItem = async (item: FileItem) => {
    try {
      const newName = prompt(`Renommer "${item.name}" :`, item.name)
      if (!newName || newName.trim() === "" || newName === item.name) return

      if (item.type === "folder") {
        await fileService.renameFolder(item.id, newName.trim())
      } else {
        await fileService.renameFile(item.id, newName.trim())
      }
      
      // Rafraîchir la liste des fichiers et le bureau
      await refreshFiles()
      await refreshDesktopFiles()
      console.log(`Élément renommé en "${newName}"`)
    } catch (error) {
      console.error('Erreur lors du renommage:', error)
      showError("Erreur de renommage", "Impossible de renommer l'élément. Veuillez réessayer.")
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
      <CustomAlert {...alert} onClose={hideAlert} />
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
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center",
                iconSize === "large" && "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              )}
            >
              <span className="mr-3">🔍</span>
              Grandes icônes
              {iconSize === "large" && <span className="ml-auto">✓</span>}
            </button>
            <button
              onClick={() => handleAction("view-medium")}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center",
                iconSize === "medium" && "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              )}
            >
              <span className="mr-3">📱</span>
              Moyennes icônes
              {iconSize === "medium" && <span className="ml-auto">✓</span>}
            </button>
            <button
              onClick={() => handleAction("view-small")}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center",
                iconSize === "small" && "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              )}
            >
              <span className="mr-3">📱</span>
              Petites icônes
              {iconSize === "small" && <span className="ml-auto">✓</span>}
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
         className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
       >
         <span className="mr-3">📤</span>
         Ajouter des fichiers
       </button>

       {/* Actions sur l'élément sélectionné */}
       {selectedItem && (
         <>
           <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
           
           <button
             onClick={() => handleAction("rename")}
             className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
           >
             <span className="mr-3">✏️</span>
             Renommer
           </button>
           
           <button
             onClick={() => handleAction("delete")}
             className="w-full text-left px-3 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center"
           >
             <span className="mr-3">🗑️</span>
             Supprimer
           </button>
         </>
       )}

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