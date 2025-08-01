import React, { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextViewer } from './text-viewer'
import { ImageViewer } from './image-viewer'

interface FileViewerProps {
  file: {
    name: string
    type: 'text' | 'image' | 'folder'
    content?: string
    url?: string
    size?: number
    lastModified?: Date
  }
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export const FileViewer: React.FC<FileViewerProps> = ({
  file,
  onClose,
  onNavigate,
  hasPrevious = false,
  hasNext = false
}) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Nettoyer les URLs blob quand le composant se ferme
  useEffect(() => {
    return () => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
    }
  }, [file.url])

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (hasPrevious && onNavigate) {
            onNavigate('prev')
          }
          break
        case 'ArrowRight':
          if (hasNext && onNavigate) {
            onNavigate('next')
          }
          break
        case '+':
        case '=':
          e.preventDefault()
          setZoom(prev => Math.min(prev + 0.1, 3))
          break
        case '-':
          e.preventDefault()
          setZoom(prev => Math.max(prev - 0.1, 0.1))
          break
        case '0':
          e.preventDefault()
          setZoom(1)
          setRotation(0)
          break
        case 'r':
          e.preventDefault()
          setRotation(prev => (prev + 90) % 360)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNavigate, hasPrevious, hasNext])

  const handleDownload = () => {
    if (file.type === 'text' && file.content) {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    } else if (file.type === 'image' && file.url) {
      const a = document.createElement('a')
      a.href = file.url
      a.download = file.name
      a.click()
    }
  }

  const resetView = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {file.name}
            </h2>
            {file.size && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Navigation */}
            {onNavigate && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('prev')}
                  disabled={!hasPrevious}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('next')}
                  disabled={!hasNext}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Contrôles d'image */}
            {file.type === 'image' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
                  className="p-2"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
                  className="p-2"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetView}
                  className="p-2"
                >
                  Reset
                </Button>
              </>
            )}

            {/* Téléchargement */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="p-2"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Fermer */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-hidden">
          {file.type === 'text' && (
            <TextViewer 
              content={file.content || ''} 
              fileName={file.name}
            />
          )}
          {file.type === 'image' && (
            <ImageViewer 
              url={file.url || ''} 
              fileName={file.name}
              zoom={zoom}
              rotation={rotation}
            />
          )}
          {file.type === 'folder' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Ceci est un dossier
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Utilisez l'explorateur de fichiers pour naviguer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Barre de statut */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Type: {file.type}</span>
              {file.lastModified && (
                <span>
                  Modifié: {file.lastModified.toLocaleDateString()}
                </span>
              )}
            </div>
            {file.type === 'image' && (
              <div className="flex items-center space-x-4">
                <span>Zoom: {Math.round(zoom * 100)}%</span>
                <span>Rotation: {rotation}°</span>
              </div>
            )}
            <div className="text-xs">
              Raccourcis: Échap (fermer), ←/→ (navigation), +/- (zoom), R (rotation), 0 (reset)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 