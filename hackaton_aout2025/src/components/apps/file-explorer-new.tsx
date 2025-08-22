import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { fileService } from "@/services/file-service"
import type { FileItem } from "@/types/file-types"
import { 
  FolderIcon,
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileArchiveIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileCodeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon,
  PlusIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  MoreHorizontalIcon,
  CopyIcon,
  ScissorsIcon,
  ClipboardIcon,
  RotateCcwIcon,
  StarIcon,
  ShareIcon,
  InfoIcon,
  EditIcon,
  EyeIcon,
  ArchiveIcon,
  FolderPlusIcon,
  FilePlusIcon
} from "lucide-react"
import JSZip from "jszip"
import { useWindowStore } from "@/stores/window-store"

interface FileExplorerProps {
  initialPath?: string
}

export function FileExplorer({ initialPath = "/" }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"name" | "type" | "size" | "date">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [clipboard, setClipboard] = useState<{ action: "copy" | "cut", files: FileItem[] } | null>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [contextMenuTarget, setContextMenuTarget] = useState<FileItem | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createType, setCreateType] = useState<"folder" | "file">("folder")
  const [newItemName, setNewItemName] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [detailsItem, setDetailsItem] = useState<FileItem | null>(null)
  const [showFileViewer, setShowFileViewer] = useState(false)
  const [viewerFile, setViewerFile] = useState<{
    name: string
    type: 'text' | 'image' | 'folder'
    content?: string
    url?: string
    size?: number
    lastModified?: Date
  } | null>(null)

  //const fileExplorerRef = useRef<HTMLDivElement>(null)

  // Charger les fichiers depuis le backend
  const loadFiles = async (path: string) => {
    setLoading(true)
    try {
      const fileItems = await fileService.listAll(path)
      // Ajouter les propriétés manquantes pour la compatibilité
      const enhancedFiles = fileItems.map(file => ({
        ...file,
        isSelected: false,
        createdAt: new Date(file.createdAt),
        modifiedAt: new Date(file.modifiedAt)
      }))
      setFiles(enhancedFiles)
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  // Charger les fichiers au montage et quand le chemin change
  useEffect(() => {
    loadFiles(currentPath)
  }, [currentPath])

  // Gestionnaires d'événements clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault()
            selectAll()
            break
          case 'c':
            e.preventDefault()
            copySelected()
            break
          case 'x':
            e.preventDefault()
            cutSelected()
            break
          case 'v':
            e.preventDefault()
            pasteFiles()
            break
          case 'z':
            e.preventDefault()
            // TODO: Implémenter l'annulation
            break
        }
      } else if (e.key === 'Delete') {
        e.preventDefault()
        deleteSelected()
      } else if (e.key === 'F5') {
        e.preventDefault()
        refreshCurrentFolder()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedFiles, clipboard])

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return <FolderIcon className="w-5 h-5 text-blue-500" />
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.mimeType?.toLowerCase()
    
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return <FileImageIcon className="w-5 h-5 text-green-500" />
    }
    if (mimeType?.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension || '')) {
      return <FileAudioIcon className="w-5 h-5 text-purple-500" />
    }
    if (mimeType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(extension || '')) {
      return <FileVideoIcon className="w-5 h-5 text-red-500" />
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <FileArchiveIcon className="w-5 h-5 text-orange-500" />
    }
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension || '') || mimeType?.startsWith('text/')) {
      return <FileTextIcon className="w-5 h-5 text-gray-500" />
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'cpp', 'c'].includes(extension || '')) {
      return <FileCodeIcon className="w-5 h-5 text-yellow-500" />
    }
    
    return <FileIcon className="w-5 h-5 text-gray-400" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const navigateTo = (path: string) => {
    setCurrentPath(path)
    setSelectedFiles([])
  }

  const navigateBack = () => {
    if (currentPath === "/") return
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || "/"
    navigateTo(parentPath)
  }

  const navigateHome = () => {
    navigateTo("/")
  }

  const getBreadcrumbItems = () => {
    const parts = currentPath.split('/').filter(Boolean)
    const items = [{ name: "Accueil", path: "/" }]
    
    let currentPathBuilder = ""
    parts.forEach(part => {
      currentPathBuilder += `/${part}`
      items.push({ name: part, path: currentPathBuilder })
    })
    
    return items
  }

  const handleFileClick = (file: FileItem, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Sélection multiple
      setSelectedFiles(prev => 
        prev.includes(file.id) 
          ? prev.filter(id => id !== file.id)
          : [...prev, file.id]
      )
    } else if (event.shiftKey && selectedFiles.length > 0) {
      // Sélection par plage
      const currentIndex = files.findIndex(f => f.id === file.id)
      const lastSelectedIndex = files.findIndex(f => f.id === selectedFiles[selectedFiles.length - 1])
      const start = Math.min(currentIndex, lastSelectedIndex)
      const end = Math.max(currentIndex, lastSelectedIndex)
      const rangeFiles = files.slice(start, end + 1)
      setSelectedFiles(rangeFiles.map(f => f.id))
    } else {
      // Sélection simple
      setSelectedFiles([file.id])
    }
  }

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === "folder") {
      navigateTo(file.path)
    } else {
      // Ouvrir le fichier
      openFile(file)
    }
  }

  const openFile = async (file: FileItem) => {
    try {
      if (file.mimeType?.startsWith('image/')) {
        // Ouvrir l'image
        setViewerFile({
          name: file.name,
          type: 'image',
          url: `/api/v2/files/download?path=${encodeURIComponent(file.path)}&userId=1`,
          size: file.size,
          lastModified: new Date(file.modifiedAt)
        })
        setShowFileViewer(true)
      } else if (file.mimeType?.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'csv', 'js', 'ts', 'html', 'css'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
        // Ouvrir le fichier texte
        const content = await fileService.getFileContent(file.path)
        setViewerFile({
          name: file.name,
          type: 'text',
          content,
          size: file.size,
          lastModified: new Date(file.modifiedAt)
        })
        setShowFileViewer(true)
      } else {
        // Télécharger le fichier
        const blob = await fileService.downloadFile(file.path)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier:', error)
    }
  }

  const handleContextMenu = (event: React.MouseEvent, file?: FileItem) => {
    event.preventDefault()
    setContextMenuPosition({ x: event.clientX, y: event.clientY })
    setContextMenuTarget(file || null)
    setShowContextMenu(true)
  }

  const selectAll = () => {
    setSelectedFiles(files.map(f => f.id))
  }

  const copySelected = () => {
    const selectedItems = files.filter(f => selectedFiles.includes(f.id))
    setClipboard({ action: "copy", files: selectedItems })
  }

  const cutSelected = () => {
    const selectedItems = files.filter(f => selectedFiles.includes(f.id))
    setClipboard({ action: "cut", files: selectedItems })
  }

  const pasteFiles = () => {
    if (!clipboard) return
    // TODO: Implémenter le collage
    console.log('Coller:', clipboard)
  }

  const deleteSelected = async () => {
    if (selectedFiles.length === 0) return
    
    if (confirm(`Voulez-vous vraiment supprimer ${selectedFiles.length} élément(s) ?`)) {
      try {
        for (const fileId of selectedFiles) {
          const file = files.find(f => f.id === fileId)
          if (file) {
            await fileService.deleteFile(file.path)
          }
        }
        loadFiles(currentPath)
        setSelectedFiles([])
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const createArchive = async () => {
    if (selectedFiles.length === 0) return
    
    try {
      const zip = new JSZip()
      const selectedItems = files.filter(f => selectedFiles.includes(f.id))
      
      // Fonction pour ajouter récursivement les fichiers et dossiers
      const addToZip = async (items: FileItem[], basePath: string = '') => {
        for (const file of items) {
          const filePath = basePath ? `${basePath}/${file.name}` : file.name
          
          if (file.type === 'file') {
            try {
              // Déterminer si c'est un fichier texte ou binaire
              const isTextFile = file.mimeType?.startsWith('text/') || 
                                file.extension === 'txt' ||
                                file.extension === 'md' ||
                                file.extension === 'json' ||
                                file.extension === 'xml' ||
                                file.extension === 'html' ||
                                file.extension === 'css' ||
                                file.extension === 'js'

              if (isTextFile) {
                // Pour les fichiers texte, utiliser getFileContent
                const content = await fileService.getFileContent(file.path)
                zip.file(filePath, content)
              } else {
                // Pour les fichiers binaires (images, PDF, audio, etc.), utiliser downloadFile
                const blob = await fileService.downloadFile(file.path)
                zip.file(filePath, blob)
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération du contenu de ${file.name}:`, error)
              // Ajouter un fichier d'erreur dans l'archive
              zip.file(`${filePath}.error`, `Erreur lors de la récupération du contenu: ${error}`)
            }
          } else if (file.type === 'folder') {
            // Créer le dossier dans le ZIP
            zip.folder(filePath)
            
            // Récupérer le contenu du dossier et l'ajouter récursivement
            try {
              const folderContent = await fileService.listAll(file.path)
              if (folderContent.length > 0) {
                await addToZip(folderContent, filePath)
              } else {
                // Si le dossier est vide, ajouter un fichier .gitkeep
                zip.file(`${filePath}/.gitkeep`, '')
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération du contenu du dossier ${file.name}:`, error)
              // Ajouter un fichier d'erreur dans l'archive
              zip.file(`${filePath}/.error`, `Erreur lors de la récupération du contenu du dossier: ${error}`)
            }
          }
        }
      }
      
      // Ajouter tous les éléments sélectionnés
      await addToZip(selectedItems)
      
      // Ajouter un fichier README avec les informations de l'archive
      const readmeContent = `# Archive créée le ${new Date().toLocaleDateString('fr-FR')}

## Contenu de l'archive:
${selectedItems.map(item => `- ${item.name} (${item.type === 'file' ? 'fichier' : 'dossier'})`).join('\n')}

## Informations:
- Nombre total d'éléments: ${selectedItems.length}
- Taille totale: ${formatFileSize(selectedItems.reduce((sum, f) => sum + f.size, 0))}
- Date de création: ${new Date().toISOString()}

## Note:
Cette archive a été créée depuis l'explorateur de fichiers de l'application AEMT.
Les fichiers texte contiennent leur contenu réel, les fichiers binaires (images, PDF, audio, etc.) sont inclus dans leur format original.
`

      zip.file('README.txt', readmeContent)
      
      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `archive_${new Date().toISOString().slice(0, 10)}_${selectedItems.length}_fichiers.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de la création de l\'archive:', error)
    }
  }

  const refreshCurrentFolder = () => {
    loadFiles(currentPath)
  }

  const createNewItem = async () => {
    if (!newItemName.trim()) return
    
    try {
      if (createType === "folder") {
        await fileService.createFolder(currentPath, newItemName)
      } else {
        // Forcer l'extension .txt pour les fichiers créés dans l'explorateur
        let fileName = newItemName
        if (!fileName.toLowerCase().endsWith('.txt')) {
          fileName += '.txt'
        }
        await fileService.createFile(currentPath, fileName, "")
      }
      
      setShowCreateDialog(false)
      setNewItemName("")
      loadFiles(currentPath)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const showItemDetails = (file: FileItem) => {
    setDetailsItem(file)
    setShowDetails(true)
  }

  const toggleFavorite = async (file: FileItem) => {
    try {
      if (file.type === "folder") {
        await fileService.toggleFolderFavorite(file.path)
      } else {
        await fileService.toggleFileFavorite(file.path)
      }
      loadFiles(currentPath)
    } catch (error) {
      console.error('Erreur lors du basculement du favori:', error)
    }
  }

  const toggleFavoriteFile = async () => {
    try {
      const favorites = await fileService.getFavoriteFiles(); // récupère uniquement les favoris
      console.log('Fichiers favoris:', favorites);
      loadFiles(currentPath); // recharge l'affichage si nécessaire
    } catch (error) {
      console.error("Erreur lors du chargement des favoris :", error);
    }
  };



  // Filtrage et tri des fichiers
  const filteredAndSortedFiles = files
    .filter(file => 
      searchQuery === "" || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
        case "size":
          comparison = a.size - b.size
          break
        case "date":
          comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()
          break
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={navigateBack}>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={navigateHome}>
            <HomeIcon className="w-4 h-4" />
          </Button>
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-1">
            {getBreadcrumbItems().map((item, index) => (
              <div key={item.path} className="flex items-center">
                {index > 0 && <ChevronRightIcon className="w-3 h-3 text-gray-400" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo(item.path)}
                  className="text-sm"
                >
                  {item.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={refreshCurrentFolder}>
            <RotateCcwIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateDialog(true)}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Barre de recherche et options */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher des fichiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="name">Nom</option>
            <option value="type">Type</option>
            <option value="size">Taille</option>
            <option value="date">Date</option>
          </select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <GridIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : filteredAndSortedFiles.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Aucun fichier trouvé</div>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-6 gap-4" : "space-y-1"}>
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className={`
                  ${viewMode === "grid" 
                    ? "p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" 
                    : "flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b"
                  }
                  ${selectedFiles.includes(file.id) ? "bg-blue-100" : ""}
                `}
                onClick={(e) => handleFileClick(file, e)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                {viewMode === "grid" ? (
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {getFileIcon(file)}
                    </div>
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {file.type === "folder" ? "Dossier" : formatFileSize(file.size)}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 flex-1">
                      {getFileIcon(file)}
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(new Date(file.modifiedAt))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 w-24 text-right">
                      {file.type === "folder" ? "Dossier" : formatFileSize(file.size)}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {file.isFavorite && <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(file)
                        }}
                      >
                        <StarIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          showItemDetails(file)
                        }}
                      >
                        <InfoIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barre de statut */}
      <div className="flex items-center justify-between p-2 border-t bg-gray-50 text-sm text-gray-600">
        <div>
          {selectedFiles.length > 0 
            ? `${selectedFiles.length} élément(s) sélectionné(s)` 
            : `${filteredAndSortedFiles.length} élément(s)`
          }
        </div>
        <div>
          {currentPath}
        </div>
      </div>

      {/* Dialog de création */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Créer un nouvel élément</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={createType === "folder" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCreateType("folder")}
                    >
                      <FolderPlusIcon className="w-4 h-4 mr-2" />
                      Dossier
                    </Button>
                    <Button
                      variant={createType === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCreateType("file")}
                    >
                      <FilePlusIcon className="w-4 h-4 mr-2" />
                      Fichier
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={`Nom du ${createType}`}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false)
                      setNewItemName("")
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={createNewItem}>
                    Créer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Menu contextuel */}
      {showContextMenu && (
        <div
          className="fixed bg-white border rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
            <EyeIcon className="w-4 h-4 mr-2" />
            Ouvrir
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
            <EditIcon className="w-4 h-4 mr-2" />
            Renommer
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
            <CopyIcon className="w-4 h-4 mr-2" />
            Copier
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
            <ScissorsIcon className="w-4 h-4 mr-2" />
            Couper
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Télécharger
          </button>
          <hr className="my-1" />
          <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-600">
            <TrashIcon className="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      )}

      {/* Visionneuse de fichiers */}
      {showFileViewer && viewerFile && (
        <FileViewer
          file={viewerFile}
          onClose={() => {
            setShowFileViewer(false)
            setViewerFile(null)
          }}
        />
      )}
    </div>
  )
} 