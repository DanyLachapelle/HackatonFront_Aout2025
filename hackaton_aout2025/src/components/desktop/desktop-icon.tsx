import { useState, useRef, useEffect } from "react"
import type { FileItem } from "@/types/file-types"
import type { DesktopApp } from "@/types/desktop-types"
import { cn } from "@/lib/utils"
import { getFileItemIconEmoji } from "@/lib/file-icons"

interface DesktopIconProps {
  item: FileItem | DesktopApp
  position: { x: number; y: number }
  onDoubleClick: () => void
  onContextMenu: (e: React.MouseEvent, item: FileItem | DesktopApp) => void
  onPositionChange: (id: string, newPosition: { x: number; y: number }) => void
  tooltip?: string
}

export function DesktopIcon({ item, position, onDoubleClick, onContextMenu, onPositionChange, tooltip }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentPosition, setCurrentPosition] = useState(position)
  const iconRef = useRef<HTMLDivElement>(null)

  // Mettre à jour la position quand elle change depuis le parent
  useEffect(() => {
    setCurrentPosition(position)
  }, [position])

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
    
    setIsSelected(true)
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
      
      // Limiter la position aux limites de l'écran
      const maxX = window.innerWidth - 80 // Largeur de l'icône
      const maxY = window.innerHeight - 80 // Hauteur de l'icône
      
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
  }, [isDragging, dragOffset, currentPosition])

  return (
    <div
      ref={iconRef}
      className={cn(
        "absolute flex flex-col items-center w-20 h-20 p-2 cursor-pointer select-none",
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
      onContextMenu={(e) => onContextMenu(e, item)}
      onClick={(e) => {
        if (!isDragging) {
          setIsSelected(!isSelected)
        }
      }}
      title={tooltip || getName()}
    >
      <div className="text-3xl mb-1 pointer-events-none">
        {getIcon()}
      </div>
      <div className="text-xs text-white text-center font-medium truncate w-full pointer-events-none">
        {getName()}
      </div>
    </div>
  )
} 