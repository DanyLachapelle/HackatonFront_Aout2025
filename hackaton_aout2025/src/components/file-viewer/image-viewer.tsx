import React, { useState, useEffect, useRef } from 'react'
import { Image, Download, Info } from 'lucide-react'

interface ImageViewerProps {
  url: string
  fileName: string
  zoom: number
  rotation: number
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  url, 
  fileName, 
  zoom, 
  rotation 
}) => {
  const [imageInfo, setImageInfo] = useState<{
    width: number
    height: number
    naturalWidth: number
    naturalHeight: number
    loaded: boolean
  }>({
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
    loaded: false
  })
  const [showInfo, setShowInfo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!url) {
      setError('Aucune URL d\'image fournie')
      return
    }

    const img = new window.Image()
    img.onload = () => {
      setImageInfo({
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        loaded: true
      })
      setError(null)
    }
    img.onerror = () => {
      setError('Impossible de charger l\'image')
      setImageInfo(prev => ({ ...prev, loaded: false }))
    }
    img.src = url
  }, [url])

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageInfo({
        width: imageRef.current.width,
        height: imageRef.current.height,
        naturalWidth: imageRef.current.naturalWidth,
        naturalHeight: imageRef.current.naturalHeight,
        loaded: true
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getImageType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'JPEG'
      case 'png':
        return 'PNG'
      case 'gif':
        return 'GIF'
      case 'webp':
        return 'WebP'
      case 'svg':
        return 'SVG'
      case 'bmp':
        return 'BMP'
      case 'ico':
        return 'ICO'
      default:
        return 'Image'
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-red-600 dark:text-red-400 mb-2">
            Erreur de chargement
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getImageType(fileName)}
            </span>
          </div>
          
          {imageInfo.loaded && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {imageInfo.naturalWidth} × {imageInfo.naturalHeight}
              </span>
              <span>
                Zoom: {Math.round(zoom * 100)}%
              </span>
              <span>
                Rotation: {rotation}°
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zone d'affichage de l'image */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
        <div 
          className="relative"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          <img
            ref={imageRef}
            src={url}
            alt={fileName}
            onLoad={handleImageLoad}
            className="max-w-none"
            style={{
              maxWidth: 'none',
              maxHeight: 'none'
            }}
          />
        </div>
      </div>

      {/* Panneau d'informations */}
      {showInfo && imageInfo.loaded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Informations de l'image
              </h3>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div>Nom: {fileName}</div>
                <div>Type: {getImageType(fileName)}</div>
                <div>Dimensions: {imageInfo.naturalWidth} × {imageInfo.naturalHeight}</div>
                <div>Taille d'affichage: {imageInfo.width} × {imageInfo.height}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Affichage actuel
              </h3>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div>Zoom: {Math.round(zoom * 100)}%</div>
                <div>Rotation: {rotation}°</div>
                <div>Rapport: {(zoom * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de statut */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {imageInfo.loaded && (
              <>
                <span>Dimensions: {imageInfo.naturalWidth} × {imageInfo.naturalHeight}</span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
                <span>Rotation: {rotation}°</span>
              </>
            )}
          </div>
          <div className="text-xs">
            Raccourcis: +/- (zoom), R (rotation), 0 (reset), I (infos)
          </div>
        </div>
      </div>
    </div>
  )
} 