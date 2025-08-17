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
  cleanIconPositions: () => void
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
        
        // Créer une grille pour éviter les superpositions
        const grid: boolean[][] = []
        const maxColumns = Math.floor((window.innerWidth - 40) / gridGapX)
        
        // Initialiser la grille
        for (let col = 0; col < maxColumns; col++) {
          grid[col] = []
          for (let row = 0; row < iconsPerColumn; row++) {
            grid[col][row] = false
          }
        }
        
        // Marquer les positions déjà occupées
        Object.values(iconPositions).forEach(pos => {
          const col = Math.floor((pos.x - 20) / gridGapX)
          const row = Math.floor((pos.y - 20) / gridGapY)
          if (col >= 0 && col < maxColumns && row >= 0 && row < iconsPerColumn) {
            grid[col][row] = true
          }
        })
        
        const newPositions: Record<string, IconPosition> = {}
        let needsUpdate = false
        
        // Trouver des positions pour les icônes qui n'en ont pas
        items.forEach((item) => {
          if (!iconPositions[item.id]) {
            needsUpdate = true
            
            // Chercher la première position libre dans la grille
            let found = false
            for (let col = 0; col < maxColumns && !found; col++) {
              for (let row = 0; row < iconsPerColumn && !found; row++) {
                if (!grid[col][row]) {
                  newPositions[item.id] = {
                    x: col * gridGapX + 20,
                    y: row * gridGapY + 20,
                  }
                  grid[col][row] = true
                  found = true
                }
              }
            }
            
            // Si aucune position libre n'est trouvée, ajouter à la fin
            if (!found) {
              const lastCol = Math.floor((items.length - 1) / iconsPerColumn)
              const lastRow = (items.length - 1) % iconsPerColumn
              newPositions[item.id] = {
                x: lastCol * gridGapX + 20,
                y: lastRow * gridGapY + 20,
              }
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
      cleanIconPositions: () => {
        const { desktopFiles, iconPositions } = get()
        const currentIds = new Set(desktopFiles.map(f => f.id))
        
        // Supprimer les positions des icônes qui n'existent plus
        const cleanedPositions: Record<string, IconPosition> = {}
        Object.entries(iconPositions).forEach(([id, position]) => {
          if (currentIds.has(id)) {
            cleanedPositions[id] = position
          }
        })
        
        set({ iconPositions: cleanedPositions })
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
        const maxColumns = Math.floor((window.innerWidth - 40) / gridGapX)
        
        // Créer une grille pour organiser les icônes
        const grid: boolean[][] = []
        for (let col = 0; col < maxColumns; col++) {
          grid[col] = []
          for (let row = 0; row < iconsPerColumn; row++) {
            grid[col][row] = false
          }
        }
        
        const newPositions: Record<string, IconPosition> = {}
        
        // Placer chaque icône dans la première position libre
        allItems.forEach((item) => {
          let placed = false
          
          // Chercher la première position libre dans la grille
          for (let col = 0; col < maxColumns && !placed; col++) {
            for (let row = 0; row < iconsPerColumn && !placed; row++) {
              if (!grid[col][row]) {
                newPositions[item.id] = {
                  x: col * gridGapX + 20,
                  y: row * gridGapY + 20,
                }
                grid[col][row] = true
                placed = true
              }
            }
          }
          
          // Si aucune position libre n'est trouvée, placer à la fin
          if (!placed) {
            const lastCol = Math.floor((allItems.length - 1) / iconsPerColumn)
            const lastRow = (allItems.length - 1) % iconsPerColumn
            newPositions[item.id] = {
              x: lastCol * gridGapX + 20,
              y: lastRow * gridGapY + 20,
            }
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