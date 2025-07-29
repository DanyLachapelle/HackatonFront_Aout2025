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
    return new Promise((resolve) => {
      setTimeout(() => {
        const musicFiles: FileItem[] = []
        
        const searchRecursively = (path: string) => {
          const items = mockFileSystem[path] || []
          items.forEach(item => {
            if (item.type === "file" && this.isMusicFile(item)) {
              musicFiles.push(item)
            } else if (item.type === "folder") {
              searchRecursively(item.path)
            }
          })
        }
        
        searchRecursively("/")
        resolve(musicFiles)
      }, 300)
    })
  }

  // Fonction pour rechercher récursivement les fichiers images
  async findImageFiles(): Promise<FileItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const imageFiles: FileItem[] = []
        
        const searchRecursively = (path: string) => {
          const items = mockFileSystem[path] || []
          items.forEach(item => {
            if (item.type === "file" && this.isImageFile(item)) {
              imageFiles.push(item)
            } else if (item.type === "folder") {
              searchRecursively(item.path)
            }
          })
        }
        
        searchRecursively("/")
        resolve(imageFiles)
      }, 300)
    })
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
    // Mock data pour le développement
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFiles: FileItem[] = [
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
            id: "4",
            name: "photo.jpg",
            type: "file",
            path: "/photo.jpg",
            size: 2048576,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            mimeType: "image/jpeg",
          },
        ]
        resolve(mockFiles)
      }, 500)
    })
  }

  async createFolder(parentPath: string, name: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Creating folder: ${name} in ${parentPath}`)
        resolve()
      }, 300)
    })
  }

  async createFile(parentPath: string, name: string, content: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Creating file: ${name} in ${parentPath} with content: ${content}`)
        resolve()
      }, 300)
    })
  }

  async getFileContent(path: string): Promise<string> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockContent = `Contenu du fichier: ${path}\n\nCeci est un exemple de contenu de fichier.\nVous pouvez modifier ce texte et l'enregistrer.`
        resolve(mockContent)
      }, 300)
    })
  }

  async updateFileContent(path: string, content: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Updating file: ${path} with content: ${content}`)
        resolve()
      }, 300)
    })
  }

  async deleteFile(path: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Deleting file: ${path}`)
        resolve()
      }, 300)
    })
  }

  async downloadFile(path: string): Promise<Blob> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const blob = new Blob(["Mock file content"], { type: "text/plain" })
        resolve(blob)
      }, 300)
    })
  }
}

export const fileService = new FileService() 