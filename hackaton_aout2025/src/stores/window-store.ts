import { create } from "zustand"
import type { WindowData } from "@/types/window-types"

interface WindowStore {
  windows: WindowData[]
  activeWindowId: string | null
  
  openWindow: (window: WindowData) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<WindowData>) => void
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

  openWindow: (window) => {
    set((state) => {
      const existingWindow = state.windows.find((w) => w.id === window.id)
      if (existingWindow) {
        // Si la fenêtre existe déjà, la restaurer et la mettre au premier plan
        const updatedWindows = state.windows.map((w) =>
          w.id === window.id ? { ...w, isMinimized: false } : w
        )
        return {
          windows: updatedWindows,
          activeWindowId: window.id,
        }
      }
      
      // S'assurer que la nouvelle fenêtre a toutes les propriétés requises
      const newWindow: WindowData = {
        ...window,
        isMinimized: window.isMinimized ?? false,
        isMaximized: window.isMaximized ?? false,
        zIndex: window.zIndex ?? Math.max(...state.windows.map(w => w.zIndex), 0) + 1,
      }
      
      return {
        windows: [...state.windows, newWindow],
        activeWindowId: window.id,
      }
    })
  },

  closeWindow: (id) => {
    set((state) => {
      const newWindows = state.windows.filter((w) => w.id !== id)
      const newActiveId =
        state.activeWindowId === id
          ? newWindows.length > 0
            ? newWindows[newWindows.length - 1].id
            : null
          : state.activeWindowId

      return {
        windows: newWindows,
        activeWindowId: newActiveId,
      }
    })
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }))
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }))
  },

  focusWindow: (id) => {
    set((state) => {
      const windowToFocus = state.windows.find((w) => w.id === id)
      if (!windowToFocus) return state

      const updatedWindows = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false } : w
      )

      return {
        windows: updatedWindows,
        activeWindowId: id,
      }
    })
  },

  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }))
  },
})) 