import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DesktopApp } from "@/types/desktop-types"
import type { FileItem } from "@/types/file-types"

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
  setWallpaper: (wallpaper: WallpaperConfig) => void
  setShowWallpaperSelector: (show: boolean) => void
  updateIconPosition: (id: string, position: IconPosition) => void
  initializeIconPositions: (items: (DesktopApp | FileItem)[]) => void
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
    }),
    {
      name: "desktop-settings",
    },
  ),
) 