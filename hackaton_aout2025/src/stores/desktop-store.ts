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
  setWallpaper: (wallpaper: WallpaperConfig) => void
  setShowWallpaperSelector: (show: boolean) => void
  updateIconPosition: (id: string, position: IconPosition) => void
  initializeIconPositions: (items: (DesktopApp | FileItem)[]) => void
  loadDesktopFiles: () => Promise<void>
  refreshDesktopFiles: () => Promise<void>
  addFileToDesktop: (file: FileItem) => void
  removeFileFromDesktop: (fileId: string) => void
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
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setShowWallpaperSelector: (show) => set({ showWallpaperSelector: show }),
      updateIconPosition: (id, position) =>
        set((state) => ({
          iconPositions: {
            ...state.iconPositions,
            [id]: position,
          },
        })),
      initializeIconPositions: (items) => {
        const { iconPositions } = get()
        const newPositions: Record<string, IconPosition> = {}
        let needsUpdate = false
        const gridGapY = 110
        const gridGapX = 120
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
    }),
    {
      name: "desktop-settings",
    },
  ),
) 