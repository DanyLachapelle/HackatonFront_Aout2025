import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { 
  GridIcon, 
  ListIcon, 
  ZoomInIcon, 
  ZoomOutIcon, 
  RotateCwIcon,
  DownloadIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  SearchIcon,
  ImageIcon,
  CalendarIcon,
  FileImageIcon
} from "lucide-react"

interface ImageItem {
  id: string
  name: string
  url: string
  size: number
  date: string
  description?: string
  tags: string[]
}

export function ImageGallery() {
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: "1",
      name: "Paysage montagneux",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      size: 2048576,
      date: "2024-01-15",
      description: "Magnifique vue sur les montagnes enneigées",
      tags: ["paysage", "montagne", "nature"]
    },
    {
      id: "2",
      name: "Plage tropicale",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      size: 1536000,
      date: "2024-01-20",
      description: "Plage de sable blanc et eau turquoise",
      tags: ["plage", "tropical", "mer"]
    },
    {
      id: "3",
      name: "Forêt automnale",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&sat=-50",
      size: 1843200,
      date: "2024-02-10",
      description: "Forêt aux couleurs d'automne",
      tags: ["forêt", "automne", "nature"]
    },
    {
      id: "4",
      name: "Ville la nuit",
      url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop",
      size: 2560000,
      date: "2024-02-25",
      description: "Skyline urbain illuminé",
      tags: ["ville", "nuit", "urbain"]
    },
    {
      id: "5",
      name: "Fleurs de printemps",
      url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
      size: 1280000,
      date: "2024-03-05",
      description: "Champ de fleurs colorées",
      tags: ["fleurs", "printemps", "couleurs"]
    },
    {
      id: "6",
      name: "Désert de sable",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&sat=50",
      size: 1920000,
      date: "2024-03-15",
      description: "Dunes de sable dorées",
      tags: ["désert", "sable", "chaleur"]
    },
    {
      id: "7",
      name: "Lac de montagne",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&hue=180",
      size: 2240000,
      date: "2024-04-01",
      description: "Lac cristallin entouré de montagnes",
      tags: ["lac", "montagne", "reflet"]
    },
    {
      id: "8",
      name: "Coucher de soleil",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&sat=100",
      size: 1760000,
      date: "2024-04-10",
      description: "Soleil couchant sur l'océan",
      tags: ["coucher", "soleil", "océan"]
    }
  ])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const openImageViewer = (image: ImageItem) => {
    setSelectedImage(image)
    setCurrentImageIndex(filteredImages.findIndex(img => img.id === image.id))
    setZoom(1)
    setRotation(0)
  }

  const closeImageViewer = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (direction === "prev") {
      const newIndex = currentImageIndex === 0 ? filteredImages.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(newIndex)
      setSelectedImage(filteredImages[newIndex])
    } else {
      const newIndex = currentImageIndex === filteredImages.length - 1 ? 0 : currentImageIndex + 1
      setCurrentImageIndex(newIndex)
      setSelectedImage(filteredImages[newIndex])
    }
    setZoom(1)
    setRotation(0)
  }

  const handleZoom = (newZoom: number) => {
    setZoom(Math.max(0.1, Math.min(5, newZoom)))
  }

  const handleRotation = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const deleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    if (selectedImage?.id === imageId) {
      closeImageViewer()
    }
  }

  const downloadImage = (image: ImageItem) => {
    const link = document.createElement("a")
    link.href = image.url
    link.download = image.name
    link.click()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return

      switch (e.key) {
        case "Escape":
          closeImageViewer()
          break
        case "ArrowLeft":
          navigateImage("prev")
          break
        case "ArrowRight":
          navigateImage("next")
          break
        case "+":
        case "=":
          handleZoom(zoom + 0.2)
          break
        case "-":
          handleZoom(zoom - 0.2)
          break
        case "r":
          handleRotation()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage, zoom, currentImageIndex])

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Galerie d'images
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher des images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-auto">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => openImageViewer(image)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white text-gray-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteImage(image.id)
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate">{image.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{formatFileSize(image.size)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <CalendarIcon className="w-3 h-3" />
                      {formatDate(image.date)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openImageViewer(image)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{image.name}</h3>
                      <p className="text-sm text-gray-500">{image.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>{formatFileSize(image.size)}</span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {formatDate(image.date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(image)
                        }}
                        title="Télécharger l'image"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteImage(image.id)
                        }}
                        title="Supprimer l'image"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <FileImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune image trouvée</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche</p>
          </div>
        )}
      </div>

      {/* Visualiseur d'image plein écran */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Image */}
            <div className="relative max-w-full max-h-full overflow-auto">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease"
                }}
              />
            </div>

            {/* Contrôles */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeImageViewer}
                  className="bg-white/20 text-white hover:bg-white/30"
                  title="Fermer le visualiseur (Échap)"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
                <span className="text-white font-medium">{selectedImage.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(zoom - 0.2)}
                  className="bg-white/20 text-white hover:bg-white/30"
                  title="Dézoomer (-)"
                >
                  <ZoomOutIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(zoom + 0.2)}
                  className="bg-white/20 text-white hover:bg-white/30"
                  title="Zoomer (+)"
                >
                  <ZoomInIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotation}
                  className="bg-white/20 text-white hover:bg-white/30"
                  title="Faire pivoter (R)"
                >
                  <RotateCwIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadImage(selectedImage)}
                  className="bg-white/20 text-white hover:bg-white/30"
                  title="Télécharger"
                >
                  <DownloadIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteImage(selectedImage.id)}
                  className="bg-white/20 text-white hover:bg-white/30"
                  title="Supprimer"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateImage("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
              title="Image précédente (←)"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateImage("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
              title="Image suivante (→)"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </Button>

            {/* Informations */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedImage.name}</h3>
                  <p className="text-sm text-gray-300">{selectedImage.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span>{formatFileSize(selectedImage.size)}</span>
                    <span>{formatDate(selectedImage.date)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  {currentImageIndex + 1} / {filteredImages.length}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedImage.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/20 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 