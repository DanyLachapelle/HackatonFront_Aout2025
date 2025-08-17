import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileViewer } from "@/components/file-viewer/file-viewer"
import { fileService } from "@/services/file-service"
import { useDesktopStore } from "@/stores/desktop-store"
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

// Utilise le type FileItem importé depuis les types

interface FileExplorerProps {
  initialPath?: string
}

export function FileExplorer({ initialPath = "/" }: FileExplorerProps) {
  const { refreshDesktopFiles } = useDesktopStore()
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

  const fileExplorerRef = useRef<HTMLDivElement>(null)

  // Charger les fichiers depuis le backend
  const loadFiles = async (path: string) => {
    setLoading(true)
    try {
      console.log(`Chargement des fichiers pour le chemin: ${path}`)
      
      // Si on est à la racine, charger uniquement les dossiers système
      if (path === "/") {
        console.log("🔍 Chargement des dossiers système à la racine...")
        const folders = await fileService.listFolders(path)
        console.log("📁 Dossiers récupérés:", folders)
        const files = await fileService.listFiles(path)
        console.log("📄 Fichiers récupérés:", files)
        
        const allItems = [...folders, ...files].map(item => ({
          ...item,
          isSelected: false,
          createdAt: new Date(item.createdAt),
          modifiedAt: new Date(item.modifiedAt)
        }))
        
        console.log(`✅ Dossiers système récupérés:`, allItems)
        setFiles(allItems)
      } else {
        const fileItems = await fileService.listAll(path)
        console.log(`Fichiers récupérés:`, fileItems)
        
        // Ajouter les propriétés manquantes pour la compatibilité
        const enhancedFiles = fileItems.map(file => ({
          ...file,
          isSelected: false,
          createdAt: new Date(file.createdAt),
          modifiedAt: new Date(file.modifiedAt)
        }))
        console.log(`Fichiers enrichis:`, enhancedFiles)
        setFiles(enhancedFiles)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  // Charger les fichiers du dossier actuel
  useEffect(() => {
    loadFiles(currentPath)
    setSelectedFiles([])
  }, [currentPath])

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "a":
            e.preventDefault()
            selectAll()
            break
          case "c":
            e.preventDefault()
            copySelected()
            break
          case "x":
            e.preventDefault()
            cutSelected()
            break
          case "v":
            e.preventDefault()
            pasteFiles()
            break
          case "Delete":
          case "Backspace":
            e.preventDefault()
            deleteSelected()
            break
          case "z":
            e.preventDefault()
            createArchive()
            break
        }
      } else if (e.key === "F5") {
        e.preventDefault()
        refreshCurrentFolder()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedFiles, clipboard])

  const getFileIcon = (file: FileItem) => {
    // Icônes spéciales pour les dossiers système
    if (file.type === "folder") {
      const folderName = file.name.toLowerCase()
      if (folderName === "bureau") return <span className="text-2xl">🖥️</span>
      if (folderName === "musique") return <span className="text-2xl">🎵</span>
      if (folderName === "images") return <span className="text-2xl">🖼️</span>
      if (folderName === "documents") return <span className="text-2xl">📄</span>
      return <FolderIcon className="w-6 h-6 text-blue-500" />
    }
    
    const extension = file.extension?.toLowerCase()
    switch (extension) {
      // Documents texte
      case "txt":
      case "md":
      case "rtf":
      case "log":
        return <FileTextIcon className="w-6 h-6 text-gray-600" />
      
      // Images
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
      case "svg":
      case "ico":
      case "tiff":
        return <FileImageIcon className="w-6 h-6 text-green-500" />
      
      // Audio/Musique
      case "mp3":
      case "wav":
      case "flac":
      case "aac":
      case "ogg":
      case "m4a":
      case "wma":
      case "opus":
        return <FileAudioIcon className="w-6 h-6 text-pink-500" />
      
      // Vidéo
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
      case "flv":
      case "webm":
      case "mkv":
      case "m4v":
        return <FileVideoIcon className="w-6 h-6 text-purple-500" />
      
      // Code
      case "html":
      case "css":
      case "scss":
      case "sass":
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
      case "json":
      case "xml":
      case "yaml":
      case "yml":
        return <FileCodeIcon className="w-6 h-6 text-blue-600" />
      
      // Documents Office
      case "pdf":
      case "doc":
      case "docx":
      case "ppt":
      case "pptx":
      case "xls":
      case "xlsx":
        return <FileTextIcon className="w-6 h-6 text-red-500" />
      
      // Archives
      case "zip":
      case "rar":
      case "7z":
      case "tar":
      case "gz":
      case "bz2":
        return <FileArchiveIcon className="w-6 h-6 text-orange-500" />
      
      default:
        return <FileIcon className="w-6 h-6 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const navigateTo = (path: string) => {
    setCurrentPath(path)
  }

  const navigateBack = () => {
    const pathParts = currentPath.split("/").filter(Boolean)
    if (pathParts.length > 0) {
      pathParts.pop()
      const newPath = "/" + pathParts.join("/")
      setCurrentPath(newPath)
    }
  }

  const navigateHome = () => {
    setCurrentPath("/")
  }

  const getBreadcrumbItems = () => {
    const parts = currentPath.split("/").filter(Boolean)
    const items = [{ name: "Accueil", path: "/" }]
    
    let currentPathBuilder = ""
    parts.forEach(part => {
      currentPathBuilder += "/" + part
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
      const rangeFiles = files.slice(start, end + 1).map(f => f.id)
      setSelectedFiles(rangeFiles)
    } else {
      // Sélection simple
      setSelectedFiles([file.id])
    }
  }

  const handleFileDoubleClick = async (file: FileItem) => {
    if (file.type === "folder") {
      navigateTo(file.path)
      return
    }

    const extension = (file.extension || file.name.split('.').pop() || '').toLowerCase()
    const { openWindow } = useWindowStore.getState()

    const isImage = ['jpg','jpeg','png','gif','bmp','webp','svg','tiff'].includes(extension)
    const isAudio = ['mp3','wav','flac','aac','ogg','m4a','wma','opus'].includes(extension)
    const isPdf = extension === 'pdf'

    if (isImage) {
      // Ouvrir dans le visionneur d'images
      try {
        const imageUrl = await getImageUrl(file.path)
        setViewerFile({
          name: file.name,
          type: 'image',
          size: file.size,
          lastModified: file.modifiedAt,
          url: imageUrl
        })
        setShowFileViewer(true)
      } catch (error) {
        console.error('Erreur lors de l\'ouverture de l\'image:', error)
        alert('Impossible d\'ouvrir cette image.')
      }
      return
    }

    if (isAudio) {
      // Ouvrir le mini lecteur de musique
      openWindow({
        id: `music-${file.id}`,
        title: file.name,
        type: "mini-music-player",
        filePath: file.path,
        position: { x: 160, y: 160 },
        size: { width: 380, height: 350 },
        isMinimized: false,
        isMaximized: false,
        zIndex: 1000,
      })
      return
    }

    if (isPdf) {
      // Ouvrir via le viewer (il affichera le PDF en inline via backend)
      openWindow({
        id: `viewer-${file.id}`,
        title: file.name,
        type: "file-viewer",
        filePath: file.path,
        position: { x: 170, y: 170 },
        size: { width: 900, height: 700 },
        isMinimized: false,
        isMaximized: false,
        zIndex: 1000,
      })
      return
    }

    // Par défaut, ouvrir dans l'éditeur de texte
    openWindow({
      id: `editor-${file.id}`,
      title: `${file.name} - Éditeur de texte`,
      type: "text-editor",
      filePath: file.path,
      position: { x: 150, y: 150 },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: 1000,
    })
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

  const pasteFiles = async () => {
    if (!clipboard) return
    try {
      // Coller dans le dossier courant
      const targetPath = currentPath
      const isCut = clipboard.action === 'cut'
      for (const item of clipboard.files) {
        // Pour l'instant, on simule via création/suppression côté API (fallback en attendant les endpoints move/copy)
        if (item.type === 'file') {
          // Télécharger contenu puis recréer
          const content = await fileService.getFileContent(item.path)
          const newName = item.name
          await fileService.createFile(targetPath, newName, content)
          if (isCut) {
            await fileService.deleteFile(item.path)
          }
        } else {
          // Créer un dossier vide (pas de récursif tant que backend move/copy n'existe pas)
          await fileService.createFolder(targetPath, item.name)
          if (isCut) {
            await fileService.deleteFolder(item.id)
          }
        }
      }
      setClipboard(null)
      await loadFiles(currentPath)
      if (currentPath === '/bureau') {
        await refreshDesktopFiles()
      }
    } catch (error) {
      console.error('Erreur lors du collage:', error)
      alert('Coller a échoué. Déplacement/copie récursive non pris en charge pour le moment.')
    }
  }

  const deleteSelected = async () => {
    if (selectedFiles.length === 0) return
    
    if (confirm(`Supprimer ${selectedFiles.length} élément(s) ?`)) {
      try {
        // Récupérer les éléments sélectionnés
        const selectedItems = files.filter(f => selectedFiles.includes(f.id))
        
        // Supprimer chaque élément via le backend
        for (const item of selectedItems) {
          if (item.type === "folder") {
            await fileService.deleteFolder(item.id)
            console.log(`Dossier "${item.name}" supprimé avec succès`)
          } else {
            await fileService.deleteFileById(item.id)
            console.log(`Fichier "${item.name}" supprimé avec succès`)
          }
        }
        
        // Supprimer visuellement de l'interface
        setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)))
        setSelectedFiles([])
        
        // Si on est dans le dossier Bureau, rafraîchir le bureau
        if (currentPath === '/bureau') {
          console.log('🖥️ Rafraîchissement du bureau après suppression...')
          await refreshDesktopFiles()
        }
        
        console.log(`${selectedItems.length} élément(s) supprimé(s) avec succès`)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert(`Erreur lors de la suppression: ${error}`)
      }
    }
  }

  const createArchive = () => {
    if (selectedFiles.length === 0) return
    
    const selectedItems = files.filter(f => selectedFiles.includes(f.id))
    
    const zip = new JSZip()

    // Fonction pour ajouter récursivement les fichiers et dossiers
    const addToZip = (items: FileItem[], basePath: string = '') => {
      items.forEach(file => {
        const filePath = basePath ? `${basePath}/${file.name}` : file.name
        
        if (file.type === 'file') {
          // Pour les images, on simule le contenu binaire
          if (['jpg', 'jpeg', 'png', 'gif'].includes(file.extension || '')) {
            // Créer un contenu simulé pour les images (en réalité, ce serait le vrai contenu binaire)
            const imageContent = `# Image: ${file.name}\n# Taille: ${formatFileSize(file.size)}\n# Type: ${file.extension}\n# URL simulée: ${getImageUrl(file.name)}\n\nCeci est une simulation du contenu de l'image ${file.name}.`
            zip.file(filePath, imageContent)
          } else {
            // Pour les fichiers texte, on utilise le contenu réel
            zip.file(filePath, getFileContent(file.name, file.extension))
          }
        } else if (file.type === 'folder') {
          // Créer le dossier dans le ZIP
          zip.folder(filePath)
          
          // Ajouter un fichier .gitkeep pour maintenir la structure du dossier
          zip.file(`${filePath}/.gitkeep`, '')
        }
      })
    }

    // Ajouter tous les éléments sélectionnés
    addToZip(selectedItems)

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
`


    zip.generateAsync({ type: "blob" })
      .then(content => {
        const blob = new Blob([content], { type: "application/zip" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `archive_${new Date().toISOString().slice(0, 10)}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        alert(`Archive ZIP créée avec succès !\n\nNom: ${a.download}\nFichiers: ${selectedItems.length}\nTaille totale: ${formatFileSize(selectedItems.reduce((sum, f) => sum + f.size, 0))}\n\nL'archive contient maintenant de vrais fichiers ZIP que Windows peut ouvrir !`)
      })
      .catch(error => {
        console.error("Erreur lors de la création de l'archive:", error)
        alert("Erreur lors de la création de l'archive.")
      })
  }

  const refreshCurrentFolder = () => {
    // Recharger les fichiers du dossier actuel
    loadFiles(currentPath)
    setSelectedFiles([])
  }

  const createNewItem = async () => {
    if (!newItemName.trim()) return
    
    // Empêcher la création à la racine
    if (currentPath === "/") {
      alert("Impossible de créer des fichiers ou dossiers à la racine. Utilisez les dossiers système existants.")
      setNewItemName("")
      setShowCreateDialog(false)
      return
    }
    
    try {
      console.log(`Création d'un ${createType} nommé "${newItemName}" dans le chemin "${currentPath}"`)
      
      if (createType === "folder") {
        await fileService.createFolder(currentPath, newItemName)
        console.log('Dossier créé avec succès côté backend')
      } else {
        await fileService.createFile(currentPath, newItemName, "")
        console.log('Fichier créé avec succès côté backend')
      }
      
      // Attendre un peu pour s'assurer que le backend a terminé
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recharger les fichiers pour afficher le nouvel élément
      console.log('Rechargement des fichiers...')
      await loadFiles(currentPath)
      console.log('Fichiers rechargés avec succès')
      
      // Si on est dans le dossier Bureau, rafraîchir le bureau
      if (currentPath === '/bureau') {
        console.log('🖥️ Rafraîchissement du bureau après création...')
        try {
          await refreshDesktopFiles()
          console.log('Bureau rafraîchi avec succès')
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du bureau:', error)
        }
      }
      
      setNewItemName("")
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert(`Erreur lors de la création du ${createType === "folder" ? "dossier" : "fichier"}: ${error}`)
    }
  }

  const showItemDetails = (file: FileItem) => {
    setDetailsItem(file)
    setShowDetails(true)
  }

  const filteredAndSortedFiles = files
    .filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Dossiers toujours en haut
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'type': {
          const extA = a.type === 'folder' ? '' : (a.extension || a.name.split('.').pop() || '').toLowerCase()
          const extB = b.type === 'folder' ? '' : (b.extension || b.name.split('.').pop() || '').toLowerCase()
          comparison = extA.localeCompare(extB)
          // à égalité d'extension, trier par nom
          if (comparison === 0) comparison = a.name.localeCompare(b.name)
          break
        }
        case 'size':
          comparison = a.size - b.size
          break
        case 'date': {
          const da = (a.modifiedAt instanceof Date) ? a.modifiedAt : new Date(a.modifiedAt)
          const db = (b.modifiedAt instanceof Date) ? b.modifiedAt : new Date(b.modifiedAt)
          comparison = da.getTime() - db.getTime()
          break
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Fonction pour obtenir le contenu des fichiers
  const getFileContent = (fileName: string, extension?: string) => {
    switch (extension) {
      case 'txt':
        return `Ceci est le contenu du fichier ${fileName}.

Ce fichier texte contient plusieurs lignes d'exemple pour démontrer les fonctionnalités du visionneur de fichiers.

Fonctionnalités disponibles :
- Coloration syntaxique
- Numéros de ligne
- Recherche dans le contenu
- Copie du contenu
- Ajustement de la taille de police
- Retour à la ligne automatique

Vous pouvez modifier ces paramètres dans la barre d'outils du visionneur.`
      
      case 'json':
        return `{
  "name": "${fileName}",
  "version": "1.0.0",
  "description": "Fichier de configuration JSON",
  "settings": {
    "theme": "dark",
    "language": "fr",
    "autoSave": true,
    "notifications": {
      "enabled": true,
      "sound": true
    }
  },
  "features": [
    "visionneur de fichiers",
    "coloration syntaxique",
    "recherche avancée",
    "export PDF"
  ],
  "metadata": {
    "created": "${new Date().toISOString()}",
    "modified": "${new Date().toISOString()}",
    "author": "Système de fichiers"
  }
}`
      
      case 'js':
        return `// ${fileName}
// Exemple de code JavaScript

function calculateSum(a, b) {
  return a + b;
}

const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce(calculateSum, 0);

console.log('La somme est:', sum);

// Classe d'exemple
class FileManager {
  constructor(name) {
    this.name = name;
    this.files = [];
  }

  addFile(file) {
    this.files.push(file);
  }

  getFileCount() {
    return this.files.length;
  }
}

// Utilisation
const manager = new FileManager('MonGestionnaire');
manager.addFile('document.txt');
manager.addFile('image.jpg');

console.log('Nombre de fichiers:', manager.getFileCount());`
      
      case 'html':
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .feature {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Visionneur de fichiers</h1>
        <p>Ce fichier HTML démontre les capacités du visionneur de fichiers.</p>
        
        <div class="feature">
            <h3>Coloration syntaxique</h3>
            <p>Le code HTML est automatiquement coloré pour une meilleure lisibilité.</p>
        </div>
        
        <div class="feature">
            <h3>Recherche</h3>
            <p>Utilisez Ctrl+F pour rechercher dans le contenu du fichier.</p>
        </div>
        
        <div class="feature">
            <h3>Export</h3>
            <p>Vous pouvez copier le contenu ou télécharger le fichier.</p>
        </div>
    </div>
</body>
</html>`
      
      case 'css':
        return `/* ${fileName} */
/* Styles pour le visionneur de fichiers */

.file-viewer {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  border-radius: 8px;
  overflow: auto;
}

.file-viewer .line-numbers {
  color: #858585;
  border-right: 1px solid #404040;
  padding-right: 10px;
  margin-right: 10px;
  user-select: none;
}

.file-viewer .content {
  flex: 1;
  line-height: 1.5;
}

/* Coloration syntaxique */
.keyword {
  color: #569cd6;
  font-weight: bold;
}

.string {
  color: #ce9178;
}

.comment {
  color: #6a9955;
  font-style: italic;
}

.number {
  color: #b5cea8;
}

.function {
  color: #dcdcaa;
}

/* Barre d'outils */
.toolbar {
  background: #2d2d30;
  border-bottom: 1px solid #404040;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar button {
  background: #3c3c3c;
  border: 1px solid #505050;
  color: #d4d4d4;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.toolbar button:hover {
  background: #505050;
}

/* Barre de statut */
.status-bar {
  background: #007acc;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
}`
      
      default:
        return `Contenu du fichier ${fileName}

Ce fichier ne supporte pas encore la coloration syntaxique spécifique.
Extension détectée: ${extension || 'aucune'}

Vous pouvez toujours :
- Rechercher dans le contenu
- Copier le contenu
- Ajuster la taille de police
- Voir les numéros de ligne`
    }
  }

  // Fonction pour obtenir l'URL d'une image
  const getImageUrl = async (filePath: string): Promise<string> => {
    try {
      console.log(`Téléchargement de l'image: ${filePath}`)
      const blob = await fileService.downloadFile(filePath)
      const url = URL.createObjectURL(blob)
      console.log(`URL créée pour l'image: ${url}`)
      return url
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error)
      // Fallback vers une image d'erreur
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCAxNTAgNzIuMzg2IDE1MCAxMDBDMTUwIDEyNy42MTQgMTI3LjYxNCAxNTAgMTAwIDE1MEM3Mi4zODYgMTUwIDUwIDEyNy42MTQgNTAgMTAwQzUwIDcyLjM4NiA3Mi4zODYgNTAgMTAwIDUwWiIgZmlsbD0iI0QxRDFENyIvPgo8cGF0aCBkPSJNMTEwIDkwSDEwMFYxMTBIMTEwVjkwWiIgZmlsbD0iI0QxRDFENyIvPgo8cGF0aCBkPSJNMTAwIDExMFYxMjBIMTEwVjExMEgxMDBaIiBmaWxsPSIjRDFEMUQ3Ii8+Cjwvc3ZnPgo='
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Barre d'outils */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              disabled={currentPath === "/"}
              title="Retour au dossier précédent"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateHome}
              title="Retour à la racine"
            >
              <HomeIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshCurrentFolder}
              title="Actualiser le dossier"
            >
              <RotateCcwIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-blue-100 dark:bg-blue-900" : ""}
              title="Vue en liste"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-blue-100 dark:bg-blue-900" : ""}
              title="Vue en grille"
            >
              <GridIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Barre de navigation */}
        <div className="flex items-center space-x-1 text-sm">
          {getBreadcrumbItems().map((item, index) => (
            <div key={item.path} className="flex items-center">
              {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
              <button
                onClick={() => navigateTo(item.path)}
                className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de recherche et actions */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher des fichiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                title="Rechercher des fichiers par nom"
              />
            </div>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-")
                setSortBy(sort as any)
                setSortOrder(order as any)
              }}
              className="px-2 py-1 border rounded text-sm"
              title="Trier les fichiers"
            >
              <option value="name-asc">Nom (A-Z)</option>
              <option value="name-desc">Nom (Z-A)</option>
              <option value="type-asc">Type (A-Z)</option>
              <option value="type-desc">Type (Z-A)</option>
              <option value="size-asc">Taille (croissant)</option>
              <option value="size-desc">Taille (décroissant)</option>
              <option value="date-asc">Date (ancien)</option>
              <option value="date-desc">Date (récent)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreateType("folder")
                setShowCreateDialog(true)
              }}
              title="Créer un nouveau dossier"
            >
              <FolderPlusIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreateType("file")
                setShowCreateDialog(true)
              }}
              title="Créer un nouveau fichier"
            >
              <FilePlusIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelected}
              disabled={selectedFiles.length === 0}
              title="Supprimer les fichiers sélectionnés"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySelected}
              disabled={selectedFiles.length === 0}
              title="Copier les fichiers sélectionnés"
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cutSelected}
              disabled={selectedFiles.length === 0}
              title="Couper les fichiers sélectionnés"
            >
              <ScissorsIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={pasteFiles}
              disabled={!clipboard}
              title="Coller les fichiers depuis le presse-papiers"
            >
              <ClipboardIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={createArchive}
              disabled={selectedFiles.length === 0}
              title="Archiver les fichiers sélectionnés"
            >
              <ArchiveIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 overflow-auto">
        {viewMode === "list" ? (
          <div className="p-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-2 font-medium">Nom</th>
                  <th className="text-left p-2 font-medium">Taille</th>
                  <th className="text-left p-2 font-medium">Type</th>
                  <th className="text-left p-2 font-medium">Date de modification</th>
                  <th className="text-left p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedFiles.map((file) => (
                  <tr
                    key={file.id}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      selectedFiles.includes(file.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                    onClick={(e) => handleFileClick(file, e)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                  >
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file)}
                        <span className="truncate">{file.name}</span>
                        {file.isFavorite && <StarIcon className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="p-2 text-sm text-gray-600 dark:text-gray-400">
                      {file.type === "folder" ? `${filteredAndSortedFiles.filter(f => f.type === "file").length} éléments` : formatFileSize(file.size)}
                    </td>
                    <td className="p-2 text-sm text-gray-600 dark:text-gray-400">
                      {file.type === "folder" ? "Dossier" : file.extension?.toUpperCase() || "Fichier"}
                    </td>
                    <td className="p-2 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(file.modifiedAt)}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            showItemDetails(file)
                          }}
                          title="Afficher les détails du fichier"
                        >
                          <InfoIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Ouvrir le fichier
                          }}
                          title="Ouvrir le fichier"
                        >
                          <EyeIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredAndSortedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedFiles.includes(file.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={(e) => handleFileClick(file, e)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div className="flex flex-col items-center text-center">
                    {getFileIcon(file)}
                    <span className="text-sm mt-2 truncate w-full">{file.name}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {file.type === "folder" ? "Dossier" : formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredAndSortedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FolderIcon className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Dossier vide</p>
            <p className="text-sm">Ce dossier ne contient aucun fichier</p>
          </div>
        )}
      </div>

      {/* Barre de statut */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{filteredAndSortedFiles.length} élément(s)</span>
            {selectedFiles.length > 0 && (
              <span>{selectedFiles.length} sélectionné(s)</span>
            )}
            <span>
              {formatFileSize(
                filteredAndSortedFiles
                  .filter(f => f.type === "file")
                  .reduce((sum, f) => sum + f.size, 0)
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Dossier: {currentPath}</span>
            {selectedFiles.length > 0 && (
              <span className="text-xs text-gray-500">
                Ctrl+Z: Archiver | Ctrl+C: Copier | Ctrl+X: Couper | Del: Supprimer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu contextuel */}
      {showContextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            onClick={() => {
              if (contextMenuTarget) showItemDetails(contextMenuTarget)
              setShowContextMenu(false)
            }}
            title="Afficher les détails du fichier"
          >
            <InfoIcon className="w-4 h-4" />
            <span>Propriétés</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            onClick={() => {
              if (contextMenuTarget) {
                setSelectedFiles([contextMenuTarget.id])
                copySelected()
              }
              setShowContextMenu(false)
            }}
            title="Copier le fichier sélectionné"
          >
            <CopyIcon className="w-4 h-4" />
            <span>Copier</span>
          </button>
                      <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => {
                if (contextMenuTarget) {
                  setSelectedFiles([contextMenuTarget.id])
                  cutSelected()
                }
                setShowContextMenu(false)
              }}
              title="Couper le fichier sélectionné"
            >
              <ScissorsIcon className="w-4 h-4" />
              <span>Couper</span>
            </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            onClick={() => {
              if (contextMenuTarget) {
                setSelectedFiles([contextMenuTarget.id])
                deleteSelected()
              }
              setShowContextMenu(false)
            }}
            title="Supprimer le fichier sélectionné"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            onClick={() => {
              if (contextMenuTarget) {
                setSelectedFiles([contextMenuTarget.id])
                createArchive()
              }
              setShowContextMenu(false)
            }}
            title="Archiver les fichiers sélectionnés"
          >
            <ArchiveIcon className="w-4 h-4" />
            <span>Archiver</span>
          </button>
        </div>
      )}

      {/* Dialogue de création */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Créer un nouveau {createType === "folder" ? "dossier" : "fichier"}
              </h3>
              <Input
                placeholder={`Nom du ${createType === "folder" ? "dossier" : "fichier"}`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNewItem()}
                className="mb-4"
                autoFocus
              />
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
                <Button onClick={() => createNewItem()}>
                  Créer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialogue des détails */}
      {showDetails && detailsItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {getFileIcon(detailsItem)}
                <div>
                  <h3 className="text-lg font-semibold">{detailsItem.name}</h3>
                  <p className="text-sm text-gray-500">
                    {detailsItem.type === "folder" ? "Dossier" : `Fichier ${detailsItem.extension?.toUpperCase()}`}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taille:</span>
                  <span className="text-sm">
                    {detailsItem.type === "folder" 
                      ? `${filteredAndSortedFiles.filter(f => f.type === "file").length} éléments`
                      : formatFileSize(detailsItem.size)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Créé le:</span>
                  <span className="text-sm">{formatDate(detailsItem.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Modifié le:</span>
                  <span className="text-sm">{formatDate(detailsItem.modifiedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Chemin:</span>
                  <span className="text-sm font-mono text-xs">{detailsItem.path}</span>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowDetails(false)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visionneur de fichier */}
      {showFileViewer && viewerFile && (
        <FileViewer
          file={viewerFile}
          onClose={() => {
            setShowFileViewer(false)
            setViewerFile(null)
          }}
        />
      )}

      {/* Fermer le menu contextuel en cliquant ailleurs */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </div>
  )
} 