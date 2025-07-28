import { useState } from "react"
import type { FileItem } from "@/types/file-types"
import type { DesktopApp } from "@/types/desktop-types"
import { cn } from "@/lib/utils"

interface DesktopIconProps {
  item: FileItem | DesktopApp
  position: { x: number; y: number }
  onDoubleClick: () => void
  tooltip?: string
}

export function DesktopIcon({ item, position, onDoubleClick, tooltip }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false)

  const getIcon = () => {
    if ("icon" in item) {
      // C'est une DesktopApp
      return item.icon
    } else {
      // C'est un FileItem
      return item.type === "folder" ? "📁" : "📄"
    }
  }

  const getName = () => {
    return item.name
  }

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center w-20 h-20 p-2 cursor-pointer select-none",
        "hover:bg-white/10 rounded-lg transition-colors",
        isSelected && "bg-blue-500/20"
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
      onDoubleClick={onDoubleClick}
      onClick={() => setIsSelected(!isSelected)}
      title={tooltip || getName()}
    >
      <div className="text-3xl mb-1">
        {getIcon()}
      </div>
      <div className="text-xs text-white text-center font-medium truncate w-full">
        {getName()}
      </div>
    </div>
  )
} 