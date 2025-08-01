import type { FileItem } from "@/types/file-types"

// Structure de données pour simuler l'arborescence complète
const mockFileSystem: Record<string, FileItem[]> = {
  "/": [
    {
      id: "1",
      name: "Documents",
      type: "folder",
      path: "/Documents",
      size: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Images",
      type: "folder",
      path: "/Images",
      size: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Musique",
      type: "folder",
      path: "/Musique",
      size: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "photo.jpg",
      type: "file",
      path: "/photo.jpg",
      size: 2048576,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "image/jpeg",
    },
  ],
  "/Documents": [
    {
      id: "5",
      name: "Travail",
      type: "folder",
      path: "/Documents/Travail",
      size: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    {
      id: "6",
      name: "rapport.txt",
      type: "file",
      path: "/Documents/rapport.txt",
      size: 1024,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "text/plain",
    },
  ],
  "/Images": [
    {
      id: "7",
      name: "vacances.jpg",
      type: "file",
      path: "/Images/vacances.jpg",
      size: 3072000,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "image/jpeg",
    },
    {
      id: "8",
      name: "screenshot.png",
      type: "file",
      path: "/Images/screenshot.png",
      size: 1536000,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "image/png",
    },
    {
      id: "9",
      name: "wallpapers",
      type: "folder",
      path: "/Images/wallpapers",
      size: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
  ],
  "/Images/wallpapers": [
    {
      id: "10",
      name: "nature.jpg",
      type: "file",
      path: "/Images/wallpapers/nature.jpg",
      size: 4096000,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "image/jpeg",
    },
    {
      id: "11",
      name: "abstract.png",
      type: "file",
      path: "/Images/wallpapers/abstract.png",
      size: 2560000,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "image/png",
    },
  ],
  "/Musique": [
    {
      id: "12",
      name: "Playlist 1",
      type: "folder",
      path: "/Musique/Playlist 1",
      size: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    {
      id: "13",
      name: "chanson.mp3",
      type: "file",
      path: "/Musique/chanson.mp3",
      size: 5242880,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "audio/mpeg",
    },
    {
      id: "14",
      name: "album.wav",
      type: "file",
      path: "/Musique/album.wav",
      size: 10485760,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "audio/wav",
    },
  ],
  "/Musique/Playlist 1": [
    {
      id: "15",
      name: "titre1.mp3",
      type: "file",
      path: "/Musique/Playlist 1/titre1.mp3",
      size: 3145728,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "audio/mpeg",
    },
    {
      id: "16",
      name: "titre2.mp3",
      type: "file",
      path: "/Musique/Playlist 1/titre2.mp3",
      size: 4194304,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "audio/mpeg",
    },
    {
      id: "17",
      name: "titre3.flac",
      type: "file",
      path: "/Musique/Playlist 1/titre3.flac",
      size: 8388608,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "audio/flac",
    },
  ],
  "/Documents/Travail": [
    {
      id: "18",
      name: "presentation.pptx",
      type: "file",
      path: "/Documents/Travail/presentation.pptx",
      size: 2097152,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
  ],
}

class FileService {
  private baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

  // Fonction pour rechercher récursivement les fichiers musicaux
  async findMusicFiles(): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/search?query=.mp3,.wav,.flac`)
      if (!response.ok) throw new Error('Erreur lors de la recherche')
      const files = await response.json()
      return files.filter((file: FileItem) => this.isMusicFile(file))
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers musicaux:', error)
      return []
    }
  }

  // Fonction pour rechercher récursivement les fichiers images
  async findImageFiles(): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/search?query=.jpg,.png,.gif,.bmp`)
      if (!response.ok) throw new Error('Erreur lors de la recherche')
      const files = await response.json()
      return files.filter((file: FileItem) => this.isImageFile(file))
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers images:', error)
      return []
    }
  }

  // Vérifier si un fichier est un fichier musical
  private isMusicFile(file: FileItem): boolean {
    const musicExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma']
    const musicMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4', 'audio/x-ms-wma']
    
    const lastDotIndex = file.name.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? file.name.toLowerCase().substring(lastDotIndex) : ''
    return musicExtensions.includes(extension) || (!!file.mimeType && musicMimeTypes.includes(file.mimeType))
  }

  // Vérifier si un fichier est une image
  private isImageFile(file: FileItem): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff']
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff']
    
    const lastDotIndex = file.name.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? file.name.toLowerCase().substring(lastDotIndex) : ''
    return imageExtensions.includes(extension) || (!!file.mimeType && imageMimeTypes.includes(file.mimeType))
  }

  async listFiles(path: string): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/list?path=${encodeURIComponent(path)}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des fichiers')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error)
      return []
    }
  }

  async createFolder(parentPath: string, name: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentPath, name })
      })
      if (!response.ok) throw new Error('Erreur lors de la création du dossier')
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
      throw error
    }
  }

  async createFile(parentPath: string, name: string, content: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentPath, name, content })
      })
      if (!response.ok) throw new Error('Erreur lors de la création du fichier')
    } catch (error) {
      console.error('Erreur lors de la création du fichier:', error)
      throw error
    }
  }

  async getFileContent(path: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/files/content?path=${encodeURIComponent(path)}`)
      if (!response.ok) throw new Error('Erreur lors de la lecture du fichier')
      return await response.text()
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error)
      throw error
    }
  }

  async updateFileContent(path: string, content: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, content })
      })
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du fichier')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier:', error)
      throw error
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files?path=${encodeURIComponent(path)}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw error
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/files/download?path=${encodeURIComponent(path)}`)
      if (!response.ok) throw new Error('Erreur lors du téléchargement')
      return await response.blob()
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      throw error
    }
  }
}

export const fileService = new FileService() 