import { useEffect, useState, useMemo, useCallback } from "react"
import { DesktopIcon } from "./desktop-icon"
import { useFileStore } from "@/stores/file-store"
import { useWindowStore } from "@/stores/window-store"
import { useDesktopStore } from "@/stores/desktop-store"
import type { FileItem } from "@/types/file-types"
import type { DesktopApp } from "@/types/desktop-types"
import { DesktopContextMenu } from "./desktop-context-menu"
import { WallpaperSelector } from "./wallpaper-selector"
import { fileService } from "@/services/file-service"
import { useCustomAlert, CustomAlert } from "@/components/ui/custom-alert"
import { DesktopModals } from "./desktop-modals"

export function Desktop() {
  const { files, loadFiles, refreshFiles } = useFileStore()
  const { openWindow } = useWindowStore()
  const { 
    wallpaper, 
    showWallpaperSelector, 
    setShowWallpaperSelector, 
    iconPositions, 
    initializeIconPositions,
    desktopFiles,
    loadDesktopFiles,
    refreshDesktopFiles,
    isLoadingDesktopFiles,
    cleanIconPositions
  } = useDesktopStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; selectedItem?: FileItem | null } | null>(null)
  const [selectedDesktopItems, setSelectedDesktopItems] = useState<string[]>([])
  const { showError, showSuccess, alert, hideAlert } = useCustomAlert()
  
  // États pour les modals
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null)
  const [newName, setNewName] = useState("")

  // Gestionnaire d'événements clavier global pour le bureau
  useEffect(() => {
    const handleDesktopKeyDown = (event: KeyboardEvent) => {
      // Échap pour désélectionner
      if (event.key === 'Escape') {
        setSelectedDesktopItems([])
      }
    }

    document.addEventListener('keydown', handleDesktopKeyDown)
    return () => {
      document.removeEventListener('keydown', handleDesktopKeyDown)
    }
  }, [])

  // Applications disponibles sur le bureau
  const desktopApps: DesktopApp[] = useMemo(
    () => [
      {
        id: "file-explorer",
        name: "Explorateur",
        icon: "📁",
        type: "file-explorer",
        description: "Gestionnaire de fichiers",
      },
      {
        id: "calculator",
        name: "Calculatrice",
        icon: "🧮",
        type: "calculator",
        description: "Calculatrice scientifique",
      },
      {
        id: "text-editor",
        name: "Éditeur",
        icon: "📝",
        type: "text-editor",
        description: "Éditeur de texte",
      },
      {
        id: "image-gallery",
        name: "Galerie",
        icon: "📱",
        type: "image-gallery",
        description: "Visionneuse d'images",
      },
      {
        id: "terminal",
        name: "Terminal",
        icon: "💻",
        type: "terminal",
        description: "Ligne de commande",
      },
      {
        id: "calendar",
        name: "Calendrier",
        icon: "📅",
        type: "calendar",
        description: "Calendrier et agenda",
      },
      {
        id: "clock",
        name: "Horloge",
        icon: "⏰",
        type: "clock",
        description: "Horloge et minuteur",
      },
      {
        id: "paint",
        name: "Paint",
        icon: "🎨",
        type: "paint",
        description: "Éditeur graphique",
      },
      {
        id: "music-player",
        name: "Musique",
        icon: "🎧",
        type: "music-player",
        description: "Lecteur audio",
      },
      {
        id: "settings",
        name: "Personnaliser le bureau",
        icon: "⚙️",
        type: "settings",
        description: "Personnaliser le fond d'écran et les couleurs",
      },
    ],
    [],
  )

  useEffect(() => {
    loadFiles("/")
  }, [loadFiles])

  // Charger les fichiers du bureau au montage du composant
  useEffect(() => {
    loadDesktopFiles()
  }, [loadDesktopFiles])

  // Initialiser les positions des icônes quand les fichiers changent
  useEffect(() => {
    if (desktopFiles.length > 0) {
      // Nettoyer les positions des icônes supprimées
      cleanIconPositions()
      // Initialiser les positions pour les nouvelles icônes
      const allItems = [...desktopApps, ...desktopFiles]
      initializeIconPositions(allItems)
    }
  }, [desktopFiles, cleanIconPositions, initializeIconPositions, desktopApps])

  // Rafraîchir le bureau quand il devient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshDesktopFiles()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshDesktopFiles])

  const allItems = useMemo(() => {
    console.log('🔄 allItems recalculé - desktopApps:', desktopApps.length, 'desktopFiles:', desktopFiles.length)
    console.log('📁 desktopFiles:', desktopFiles)
    return [...desktopApps, ...desktopFiles]
  }, [desktopApps, desktopFiles])

  useEffect(() => {
    initializeIconPositions(allItems)
  }, [allItems, initializeIconPositions])

  const handleDoubleClick = (item: FileItem | DesktopApp) => {
    if ("type" in item && item.type !== "file" && item.type !== "folder") {
      // C'est une application
      const app = item as DesktopApp
      
      if (app.type === "settings") {
        setShowWallpaperSelector(true)
        return
      }
      
      const appSizes = {
        calculator: { width: 320, height: 480 },
        "text-editor": { width: 800, height: 600 },
        "file-explorer": { width: 800, height: 600 },
        "image-gallery": { width: 800, height: 600 },
        terminal: { width: 700, height: 500 },
        calendar: { width: 800, height: 650 },
        clock: { width: 600, height: 550 },
        paint: { width: 800, height: 600 },
        "music-player": { width: 500, height: 400 },
        settings: { width: 900, height: 700 },
      }

      openWindow({
        id: `${app.type}-${Date.now()}`,
        title: app.name,
        type: app.type as any,
        position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
        size: appSizes[app.type as keyof typeof appSizes] || { width: 600, height: 400 },
        isMinimized: false,
        isMaximized: false,
        zIndex: 1000,
        initialPath: app.type === "file-explorer" ? "/" : undefined,
      })
    } else {
      // C'est un fichier
      const file = item as FileItem
      if (file.type === "folder") {
        openWindow({
          id: `explorer-${file.id}`,
          title: `Explorateur - ${file.name}`,
          type: "file-explorer",
          initialPath: file.path,
          position: { x: 100, y: 100 },
          size: { width: 800, height: 600 },
          isMinimized: false,
          isMaximized: false,
          zIndex: 1000,
        })
      } else {
        // Router selon le type du fichier
        const extension = (file.extension || file.name.split('.').pop() || '').toLowerCase()
        const isImage = ['jpg','jpeg','png','gif','bmp','webp','svg','tiff'].includes(extension)
        const isAudio = ['mp3','wav','flac','aac','ogg','m4a','wma','opus'].includes(extension)
        const isPdf = extension === 'pdf'

        if (isImage) {
          openWindow({
            id: `viewer-${file.id}`,
            title: file.name,
            type: "file-viewer",
            filePath: file.path,
            position: { x: 150, y: 150 },
            size: { width: 800, height: 600 },
            isMinimized: false,
            isMaximized: false,
            zIndex: 1000,
          })
        } else if (isAudio) {
          openWindow({
            id: `music-${file.id}`,
            title: file.name,
            type: "mini-music-player",
            filePath: file.path,
            position: { x: 160, y: 160 },
            size: { width: 380, height: 350 },
            isMinimized: false,
            isMaximized: false,
            zIndex: 1000,
          })
        } else if (isPdf) {
          // Ouvrir via le viewer inline du backend (dans une fenêtre viewer)
          openWindow({
            id: `viewer-${file.id}`,
            title: file.name,
            type: "file-viewer",
            filePath: file.path,
            position: { x: 170, y: 170 },
            size: { width: 900, height: 700 },
            isMinimized: false,
            isMaximized: false,
            zIndex: 1000,
          })
        } else {
          // Par défaut, éditeur de texte
          openWindow({
            id: `editor-${file.id}`,
            title: `${file.name} - Éditeur de texte`,
            type: "text-editor",
            filePath: file.path,
            position: { x: 180, y: 180 },
            size: { width: 800, height: 600 },
            isMinimized: false,
            isMaximized: false,
            zIndex: 1000,
          })
        }
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent, item?: FileItem | DesktopApp) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Si on clique sur un élément spécifique (fichier/dossier), afficher le menu avec cet élément
    if (item) {
      // Ne garder que les FileItem pour le menu contextuel (les DesktopApp n'ont pas de menu contextuel)
      const fileItem = 'path' in item ? item as FileItem : null
      setContextMenu({ x: e.clientX, y: e.clientY, selectedItem: fileItem })
    } else {
      // Si on clique sur l'espace vide, afficher le menu général sans élément sélectionné
      setContextMenu({ x: e.clientX, y: e.clientY, selectedItem: null })
    }
  }

  const handleIconPositionChange = (id: string, newPosition: { x: number; y: number }) => {
    // TODO: Sauvegarder la position
  }

  const handleIconSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedDesktopItems(prev => {
      if (isSelected) {
        return [...prev, id]
      } else {
        return prev.filter(itemId => itemId !== id)
      }
    })
  }

  // Debug logs
  console.log('🔍 État des modals dans Desktop:', {
    showDeleteDialog,
    showRenameDialog,
    deleteTarget: deleteTarget?.name,
    renameTarget: renameTarget?.name,
    newName
  })

  // Gestion du drag & drop pour ajouter des fichiers au bureau
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    try {
      for (const file of files) {
        // Upload vers le dossier Bureau
        await fileService.uploadFile('/bureau', file)
      }
      // Recharger les fichiers du bureau
      await loadDesktopFiles()
      // Réorganiser les icônes après l'ajout
      setTimeout(() => {
        const allItems = [...desktopApps, ...desktopFiles]
        initializeIconPositions(allItems)
      }, 100)
    } catch (error) {
      console.error('Erreur lors de l\'upload de fichiers:', error)
      showError('Erreur d\'ajout', 'Impossible d\'ajouter les fichiers au bureau. Veuillez réessayer.')
    }
  }, [loadDesktopFiles, desktopApps, desktopFiles, initializeIconPositions])



  const getWallpaperStyle = () => {
    if (wallpaper.type === "gradient") {
      return {
        background: `linear-gradient(${wallpaper.direction || "135deg"}, ${
          wallpaper.colors?.join(", ") || "#8b5cf6, #7c3aed"
        })`,
      }
    } else if (wallpaper.type === "solid") {
      return {
        backgroundColor: wallpaper.color || "#8b5cf6",
      }
    } else if (wallpaper.type === "image") {
      return {
        backgroundImage: `url(${wallpaper.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    }
    return {
      backgroundColor: "#8b5cf6",
    }
  }

  return (
    <div
      className="absolute inset-0 transition-all duration-300"
      style={getWallpaperStyle()}
      onContextMenu={(e) => {
        // Ne capturer le clic droit que si on clique sur l'espace vide (pas sur un icône)
        if (e.target === e.currentTarget) {
          handleContextMenu(e)
        }
      }}
      onClick={() => setContextMenu(null)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CustomAlert {...alert} onClose={hideAlert} />
      {/* Applications Grid */}
      {allItems.map((item) => {
        const position = iconPositions[item.id]
        if (!position) return null // Ne pas rendre si la position n'est pas encore initialisée

        return (
          <DesktopIcon
            key={item.id}
            item={item}
            position={position}
            onDoubleClick={() => handleDoubleClick(item)}
            onContextMenu={handleContextMenu}
            onPositionChange={handleIconPositionChange}
            onSelectionChange={handleIconSelectionChange}
            isSelected={selectedDesktopItems.includes(item.id)}
            tooltip={"description" in item ? item.description : undefined}
          />
        )
      })}

      {/* Menu contextuel */}
      {contextMenu && (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedItem={contextMenu.selectedItem}
          onClose={() => setContextMenu(null)}
          onPersonalize={() => {
            setShowWallpaperSelector(true)
            setContextMenu(null)
          }}
          onDelete={(item) => {
            setDeleteTarget(item)
            setShowDeleteDialog(true)
            setContextMenu(null)
          }}
          onRename={(item) => {
            setRenameTarget(item)
            setNewName(item.name)
            setShowRenameDialog(true)
            setContextMenu(null)
          }}
        />
      )}

      {/* Sélecteur de fond d'écran */}
      {showWallpaperSelector && <WallpaperSelector />}

      {/* Modals */}
      <DesktopModals
        showDeleteDialog={showDeleteDialog}
        showRenameDialog={showRenameDialog}
        deleteTarget={deleteTarget}
        renameTarget={renameTarget}
        newName={newName}
        onDeleteClose={() => {
          setShowDeleteDialog(false)
          setDeleteTarget(null)
        }}
        onRenameClose={() => {
          setShowRenameDialog(false)
          setRenameTarget(null)
          setNewName("")
        }}
        onConfirmDelete={async () => {
          if (!deleteTarget) return
          
          try {
            if (deleteTarget.type === "folder") {
              await fileService.deleteFolder(deleteTarget.id)
            } else {
              await fileService.deleteFileById(deleteTarget.id)
            }
            
            // Rafraîchir la liste des fichiers et le bureau
            await refreshFiles()
            await refreshDesktopFiles()
            console.log(`Élément "${deleteTarget.name}" supprimé avec succès`)
            showSuccess(`"${deleteTarget.name}" supprimé avec succès`, 'Suppression réussie')
          } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            showError(`Erreur lors de la suppression: ${error}`, 'Erreur de suppression')
          } finally {
            setShowDeleteDialog(false)
            setDeleteTarget(null)
          }
        }}
        onConfirmRename={async () => {
          if (!renameTarget || !newName.trim() || newName.trim() === renameTarget.name) {
            setShowRenameDialog(false)
            setRenameTarget(null)
            setNewName("")
            return
          }

          try {
            if (renameTarget.type === "folder") {
              await fileService.renameFolder(renameTarget.id, newName.trim())
            } else {
              await fileService.renameFile(renameTarget.id, newName.trim())
            }
            
            // Rafraîchir la liste des fichiers et le bureau
            await refreshFiles()
            await refreshDesktopFiles()
            console.log(`Élément renommé en "${newName.trim()}"`)
            showSuccess(`"${renameTarget.name}" renommé en "${newName.trim()}"`, 'Renommage réussi')
          } catch (error) {
            console.error('Erreur lors du renommage:', error)
            showError(`Erreur lors du renommage: ${error}`, 'Erreur de renommage')
          } finally {
            setShowRenameDialog(false)
            setRenameTarget(null)
            setNewName("")
          }
        }}
        onNewNameChange={(value) => setNewName(value)}
      />
    </div>
  )
} 