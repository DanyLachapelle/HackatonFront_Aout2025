import { useState, useRef, useEffect } from "react"
import type { FileItem } from "@/types/file-types"
import type { DesktopApp } from "@/types/desktop-types"
import { cn } from "@/lib/utils"
import { getFileItemIconEmoji } from "@/lib/file-icons"
import { useDesktopStore } from "@/stores/desktop-store"

interface DesktopIconProps {
  item: FileItem | DesktopApp
  position: { x: number; y: number }
  onDoubleClick: () => void
  onContextMenu: (e: React.MouseEvent, item: FileItem | DesktopApp) => void
  onPositionChange: (id: string, newPosition: { x: number; y: number }) => void
  onSelectionChange?: (id: string, isSelected: boolean) => void
  isSelected?: boolean
  tooltip?: string
}

export function DesktopIcon({ 
  item, 
  position, 
  onDoubleClick, 
  onContextMenu, 
  onPositionChange, 
  onSelectionChange,
  isSelected = false,
  tooltip 
}: DesktopIconProps) {
  const { iconSize } = useDesktopStore()
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentPosition, setCurrentPosition] = useState(position)
  const iconRef = useRef<HTMLDivElement>(null)

  // Mettre à jour la position quand elle change depuis le parent
  useEffect(() => {
    setCurrentPosition(position)
  }, [position])

  // Fonction pour obtenir les classes CSS selon la taille des icônes
  const getIconSizeClasses = () => {
    switch (iconSize) {
      case "small":
        return {
          container: "w-16 h-16",
          icon: "text-2xl",
          text: "text-xs"
        }
      case "large":
        return {
          container: "w-24 h-24",
          icon: "text-4xl",
          text: "text-sm"
        }
      default: // medium
        return {
          container: "w-20 h-20",
          icon: "text-3xl",
          text: "text-xs"
        }
    }
  }

  const getIcon = () => {
    if ("icon" in item) {
      // C'est une DesktopApp
      return item.icon
    } else {
      // C'est un FileItem
      return getFileItemIconEmoji(item)
    }
  }

  const getName = () => {
    return item.name
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    
    const rect = iconRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Limiter la position aux limites de l'écran selon la taille des icônes
      const iconWidth = iconSize === "small" ? 64 : iconSize === "large" ? 96 : 80
      const iconHeight = iconWidth
      
      const maxX = window.innerWidth - iconWidth
      const maxY = window.innerHeight - iconHeight
      
      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))
      
      setCurrentPosition({ x: clampedX, y: clampedY })
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      // Sauvegarder la nouvelle position
      onPositionChange(item.id, currentPosition)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, currentPosition, iconSize])

  const sizeClasses = getIconSizeClasses()

  return (
    <div
      ref={iconRef}
      className={cn(
        "absolute flex flex-col items-center p-2 cursor-pointer select-none",
        sizeClasses.container,
        "hover:bg-white/10 rounded-lg transition-colors",
        isSelected && "bg-blue-500/20",
        isDragging && "z-50 opacity-80"
      )}
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => {
        e.stopPropagation()
        onContextMenu(e, item)
      }}
      onClick={(e) => {
        if (!isDragging) {
          onSelectionChange?.(item.id, !isSelected)
        }
      }}
      title={tooltip || getName()}
    >
      <div className={cn("mb-1 pointer-events-none", sizeClasses.icon)}>
        {getIcon()}
      </div>
      <div className={cn("text-white text-center font-medium truncate w-full pointer-events-none", sizeClasses.text)}>
        {getName()}
      </div>
    </div>
  )
} 