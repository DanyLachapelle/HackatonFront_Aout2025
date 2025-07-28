import { create } from "zustand"
import type { WindowData } from "@/types/window-types"

interface WindowStore {
  windows: WindowData[]
  activeWindowId: string | null
  openWindow: (window: Omit<WindowData, "isMinimized" | "isMaximized" | "zIndex">) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<WindowData>) => void
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

  openWindow: (windowData) => {
    const { windows } = get()
    const existingWindow = windows.find((w) => w.id === windowData.id)

    if (existingWindow) {
      // Si la fenêtre existe déjà, la remettre au premier plan
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === windowData.id
            ? { ...w, isMinimized: false, zIndex: Math.max(...state.windows.map((win) => win.zIndex)) + 1 }
            : w,
        ),
        activeWindowId: windowData.id,
      }))
    } else {
      // Créer une nouvelle fenêtre
      const maxZIndex = windows.length > 0 ? Math.max(...windows.map((w) => w.zIndex)) : 0
      const newWindow: WindowData = {
        ...windowData,
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZIndex + 1,
      }

      set((state) => ({
        windows: [...state.windows, newWindow],
        activeWindowId: windowData.id,
      }))
    }
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
      windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }))
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
    }))
  },

  focusWindow: (id) => {
    set((state) => {
      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex))
      return {
        windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w)),
        activeWindowId: id,
      }
    })
  },

  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }))
  },
})) 