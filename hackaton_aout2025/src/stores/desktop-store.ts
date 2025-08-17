import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DesktopApp } from "@/types/desktop-types"
import type { FileItem } from "@/types/file-types"
import { fileService } from "@/services/file-service"

interface WallpaperConfig {
  type: "gradient" | "solid" | "image"
  colors?: string[]
  color?: string
  direction?: string
  imageUrl?: string
}

interface IconPosition {
  x: number
  y: number
}

interface DesktopStore {
  wallpaper: WallpaperConfig
  showWallpaperSelector: boolean
  iconPositions: Record<string, IconPosition>
  desktopFiles: FileItem[]
  isLoadingDesktopFiles: boolean
  iconSize: "small" | "medium" | "large"
  setWallpaper: (wallpaper: WallpaperConfig) => void
  setShowWallpaperSelector: (show: boolean) => void
  setIconSize: (size: "small" | "medium" | "large") => void
  updateIconPosition: (id: string, position: IconPosition) => void
  initializeIconPositions: (items: (DesktopApp | FileItem)[]) => void
  loadDesktopFiles: () => Promise<void>
  refreshDesktopFiles: () => Promise<void>
  addFileToDesktop: (file: FileItem) => void
  removeFileFromDesktop: (fileId: string) => void
  reorganizeIcons: () => void
}

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set, get) => ({
      wallpaper: {
        type: "gradient",
        colors: ["#8b5cf6", "#7c3aed"],
        direction: "135deg",
      },
      showWallpaperSelector: false,
      iconPositions: {},
      desktopFiles: [],
      isLoadingDesktopFiles: false,
      iconSize: "medium",
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setShowWallpaperSelector: (show) => set({ showWallpaperSelector: show }),
      setIconSize: (size) => set({ iconSize: size }),
      updateIconPosition: (id, position) =>
        set((state) => ({
          iconPositions: {
            ...state.iconPositions,
            [id]: position,
          },
        })),
      initializeIconPositions: (items) => {
        const { iconPositions, iconSize } = get()
        const newPositions: Record<string, IconPosition> = {}
        let needsUpdate = false
        
        // Ajuster l'espacement selon la taille des icônes
        const getGridSpacing = () => {
          switch (iconSize) {
            case "small":
              return { x: 80, y: 90 }
            case "large":
              return { x: 140, y: 130 }
            default: // medium
              return { x: 120, y: 110 }
          }
        }
        
        const { x: gridGapX, y: gridGapY } = getGridSpacing()
        const iconsPerColumn = Math.floor((window.innerHeight - 100) / gridGapY)

        items.forEach((item, index) => {
          if (!iconPositions[item.id]) {
            needsUpdate = true
            const col = Math.floor(index / iconsPerColumn)
            const row = index % iconsPerColumn
            newPositions[item.id] = {
              x: col * gridGapX + 20,
              y: row * gridGapY + 20,
            }
          }
        })

        if (needsUpdate) {
          set((state) => ({
            iconPositions: {
              ...state.iconPositions,
              ...newPositions,
            },
          }))
        }
      },
      loadDesktopFiles: async () => {
        set({ isLoadingDesktopFiles: true })
        try {
          console.log('🔄 Début du chargement des fichiers du bureau...')
          // Charger les fichiers ET dossiers du dossier Bureau
          const files = await fileService.listAll('/bureau')
          console.log('📁 Fichiers récupérés du service:', files)
          set({ desktopFiles: files })
          console.log('🖥️ Bureau chargé:', files.length, 'éléments')
        } catch (error) {
          console.error('Erreur lors du chargement des fichiers du bureau:', error)
        } finally {
          set({ isLoadingDesktopFiles: false })
        }
      },
      refreshDesktopFiles: async () => {
        try {
          console.log('🔄 Début du rafraîchissement du bureau...')
          // Recharger les fichiers ET dossiers du dossier Bureau
          const files = await fileService.listAll('/bureau')
          console.log('📁 Fichiers récupérés lors du rafraîchissement:', files)
          set({ desktopFiles: files })
          console.log('🖥️ Bureau rafraîchi:', files.length, 'éléments')
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du bureau:', error)
        }
      },
      addFileToDesktop: (file) => {
        set((state) => ({
          desktopFiles: [...state.desktopFiles, file]
        }))
      },
      removeFileFromDesktop: (fileId) => {
        set((state) => ({
          desktopFiles: state.desktopFiles.filter(f => f.id !== fileId)
        }))
      },
      reorganizeIcons: () => {
        const { desktopFiles, iconSize } = get()
        const allItems = [...desktopFiles] // Ajouter les apps si nécessaire
        
        // Ajuster l'espacement selon la taille des icônes
        const getGridSpacing = () => {
          switch (iconSize) {
            case "small":
              return { x: 80, y: 90 }
            case "large":
              return { x: 140, y: 130 }
            default: // medium
              return { x: 120, y: 110 }
          }
        }
        
        const { x: gridGapX, y: gridGapY } = getGridSpacing()
        const iconsPerColumn = Math.floor((window.innerHeight - 100) / gridGapY)
        
        const newPositions: Record<string, IconPosition> = {}
        
        allItems.forEach((item, index) => {
          const col = Math.floor(index / iconsPerColumn)
          const row = index % iconsPerColumn
          newPositions[item.id] = {
            x: col * gridGapX + 20,
            y: row * gridGapY + 20,
          }
        })
        
        set({ iconPositions: newPositions })
      },
    }),
    {
      name: "desktop-settings",
    },
  ),
) 