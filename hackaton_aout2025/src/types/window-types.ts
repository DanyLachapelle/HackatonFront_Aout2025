export interface WindowData {
  id: string
  title: string
  type:
    | "file-explorer"
    | "file-viewer"
    | "text-editor"
    | "image-viewer"
    | "calculator"
    | "image-gallery"
    | "terminal"
    | "calendar"
    | "clock"
    | "paint"
    | "music-player"
    | "settings"
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  initialPath?: string
  filePath?: string
} 