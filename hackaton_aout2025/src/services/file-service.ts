import type { FileItem } from "@/types/file-types"
import { config } from "@/config/environment"

// Types pour les DTOs du backend
interface FileDto {
  id: number
  name: string
  path: string
  contentType: string
  size: number
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  folderId?: number
  folderName?: string
  folderPath?: string
  userId: number
  username: string
}

interface FolderDto {
  id: number
  name: string
  path: string
  parentFolderId?: number
  parentFolderName?: string
  userId: number
  username: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface CreateFileRequest {
  parentPath: string
  name: string
  content: string
  userId: number
}

interface CreateFolderRequest {
  parentPath: string
  name: string
  userId: number
}

class FileService {
  private baseUrl = config.apiUrl
  private userId = config.defaultUserId // TODO: Récupérer depuis l'authentification

  // === CONVERSION DTOs vers FileItem ===
  
  private fileDtoToFileItem(fileDto: FileDto): FileItem {
    return {
      id: fileDto.id.toString(),
      name: fileDto.name,
      type: "file",
      path: fileDto.path,
      size: fileDto.size,
      createdAt: fileDto.createdAt,
      modifiedAt: fileDto.updatedAt,
      mimeType: fileDto.contentType,
      isFavorite: fileDto.isFavorite
    }
  }

  private folderDtoToFileItem(folderDto: FolderDto): FileItem {
    return {
      id: folderDto.id.toString(),
      name: folderDto.name,
      type: "folder",
      path: folderDto.path,
      size: 0,
      createdAt: folderDto.createdAt,
      modifiedAt: folderDto.updatedAt,
      isFavorite: folderDto.isFavorite
    }
  }

  // === MÉTHODES DE TEST ===

  async testConnection(): Promise<boolean> {
    try {
      console.log('Test de connexion au backend...')
      console.log('URL de base:', this.baseUrl)
      
      const response = await fetch(`${this.baseUrl}/files/folders?path=/&userId=${this.userId}`)
      console.log('Réponse du backend:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Données reçues:', data)
        return true
      } else {
        console.error('Erreur HTTP:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return false
    }
  }

  // === GESTION DES FICHIERS ===

  async listFiles(path: string): Promise<FileItem[]> {
    try {
      console.log('📄 listFiles appelé pour le chemin:', path)
      const url = `${this.baseUrl}/files/files?path=${encodeURIComponent(path)}&userId=${this.userId}`
      console.log('🌐 URL de la requête:', url)
      const response = await fetch(url)
      console.log('📡 Réponse HTTP:', response.status, response.statusText)
      if (!response.ok) throw new Error('Erreur lors du chargement des fichiers')
      const files: FileDto[] = await response.json()
      console.log('📄 Données brutes reçues:', files)
      const result = files.map(file => this.fileDtoToFileItem(file))
      console.log('📄 Fichiers convertis:', result)
      return result
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error)
      return []
    }
  }

  async listFolders(path: string): Promise<FileItem[]> {
    try {
      console.log('📁 listFolders appelé pour le chemin:', path)
      const url = `${this.baseUrl}/files/folders?path=${encodeURIComponent(path)}&userId=${this.userId}`
      console.log('🌐 URL de la requête:', url)
      const response = await fetch(url)
      console.log('📡 Réponse HTTP:', response.status, response.statusText)
      if (!response.ok) throw new Error('Erreur lors du chargement des dossiers')
      const folders: FolderDto[] = await response.json()
      console.log('📁 Données brutes reçues:', folders)
      const result = folders.map(folder => this.folderDtoToFileItem(folder))
      console.log('📁 Dossiers convertis:', result)
      return result
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error)
      return []
    }
  }

  async listAll(path: string): Promise<FileItem[]> {
    try {
      console.log('🔍 listAll appelé pour le chemin:', path)
      const [files, folders] = await Promise.all([
        this.listFiles(path),
        this.listFolders(path)
      ])
      console.log('📄 Fichiers récupérés:', files)
      console.log('📁 Dossiers récupérés:', folders)
      const result = [...folders, ...files].sort((a, b) => {
        // Dossiers en premier, puis par nom
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
      console.log('✅ Résultat final listAll:', result)
      return result
    } catch (error) {
      console.error('Erreur lors du chargement des éléments:', error)
      return []
    }
  }

  async createFolder(parentPath: string, name: string): Promise<void> {
    try {
      const request: CreateFolderRequest = {
        parentPath,
        name,
        userId: this.userId
      }
      
      const response = await fetch(`${this.baseUrl}/files/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
      if (!response.ok) throw new Error('Erreur lors de la création du dossier')
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
      throw error
    }
  }

  // Méthode alternative pour compatibilité avec le menu contextuel
  async createFolderWithObject(request: { name: string; path: string; userId: number }): Promise<void> {
    try {
      console.log('Tentative de création de dossier:', request)
      console.log('URL de l\'API:', `${this.baseUrl}/files/folders`)
      
      const folderRequest: CreateFolderRequest = {
        parentPath: request.path,
        name: request.name,
        userId: request.userId
      }
      
      console.log('Requête envoyée:', folderRequest)
      
      const response = await fetch(`${this.baseUrl}/files/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderRequest)
      })
      
      console.log('Réponse reçue:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erreur HTTP:', response.status, errorText)
        throw new Error(`Erreur lors de la création du dossier: ${response.status} ${response.statusText}`)
      }
      
      console.log('Dossier créé avec succès')
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
      throw error
    }
  }

  async createFile(parentPath: string, name: string, content: string): Promise<void> {
    try {
      const request: CreateFileRequest = {
        parentPath,
        name,
        content,
        userId: this.userId
      }
      
      const response = await fetch(`${this.baseUrl}/files/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
      if (!response.ok) throw new Error('Erreur lors de la création du fichier')
    } catch (error) {
      console.error('Erreur lors de la création du fichier:', error)
      throw error
    }
  }

  // Méthode alternative pour compatibilité avec le menu contextuel
  async createFileWithObject(request: { name: string; path: string; content: string; userId: number }): Promise<void> {
    try {
      const fileRequest: CreateFileRequest = {
        parentPath: request.path,
        name: request.name,
        content: request.content,
        userId: request.userId
      }
      
      const response = await fetch(`${this.baseUrl}/files/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileRequest)
      })
      if (!response.ok) throw new Error('Erreur lors de la création du fichier')
    } catch (error) {
      console.error('Erreur lors de la création du fichier:', error)
      throw error
    }
  }

  async uploadFile(parentPath: string, file: File): Promise<void> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('parentPath', parentPath)
      formData.append('userId', this.userId.toString())
      
      const response = await fetch(`${this.baseUrl}/files/files/upload`, {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('Erreur lors de l\'upload du fichier')
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error)
      throw error
    }
  }

  async getFileContent(path: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/files/files/content?path=${encodeURIComponent(path)}&userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors de la lecture du fichier')
      return await response.text()
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error)
      throw error
    }
  }

  async updateFileContent(path: string, content: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/files/content?path=${encodeURIComponent(path)}&content=${encodeURIComponent(content)}&userId=${this.userId}`, {
        method: 'PUT'
      })
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du fichier')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier:', error)
      throw error
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/files?path=${encodeURIComponent(path)}&userId=${this.userId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw error
    }
  }

  async deleteFileById(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/files/${id}?userId=${this.userId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression du fichier')
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error)
      throw error
    }
  }

  async deleteFolder(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/folders/${id}?userId=${this.userId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression du dossier')
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier:', error)
      throw error
    }
  }

  async renameFile(id: string, newName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/files/${id}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName, userId: this.userId })
      })
      if (!response.ok) throw new Error('Erreur lors du renommage du fichier')
    } catch (error) {
      console.error('Erreur lors du renommage du fichier:', error)
      throw error
    }
  }

  async renameFolder(id: string, newName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/folders/${id}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName, userId: this.userId })
      })
      if (!response.ok) throw new Error('Erreur lors du renommage du dossier')
    } catch (error) {
      console.error('Erreur lors du renommage du dossier:', error)
      throw error
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/files/download?path=${encodeURIComponent(path)}&userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors du téléchargement')
      return await response.blob()
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      throw error
    }
  }

  // === GESTION DES FAVORIS ===

  async getFavoriteFiles(): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/files/favorites?userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des favoris')
      const files: FileDto[] = await response.json()
      return files.map(file => this.fileDtoToFileItem(file))
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
      return []
    }
  }

  async getFavoriteFolders(): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/folders/favorites?userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des favoris')
      const folders: FolderDto[] = await response.json()
      return folders.map(folder => this.folderDtoToFileItem(folder))
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
      return []
    }
  }

  async toggleFileFavorite(path: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/files/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, userId: this.userId })
      })
      if (!response.ok) throw new Error('Erreur lors du basculement du favori')
    } catch (error) {
      console.error('Erreur lors du basculement du favori:', error)
      throw error
    }
  }

  async toggleFolderFavorite(path: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/folders/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, userId: this.userId })
      })
      if (!response.ok) throw new Error('Erreur lors du basculement du favori')
    } catch (error) {
      console.error('Erreur lors du basculement du favori:', error)
      throw error
    }
  }

  // === RECHERCHE ===

  async searchFiles(query: string): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/search?query=${encodeURIComponent(query)}&userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche')
      const files: FileDto[] = await response.json()
      return files.map(file => this.fileDtoToFileItem(file))
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers:', error)
      return []
    }
  }

  async searchFolders(query: string): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/folders/search?query=${encodeURIComponent(query)}&userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche')
      const folders: FolderDto[] = await response.json()
      return folders.map(folder => this.folderDtoToFileItem(folder))
    } catch (error) {
      console.error('Erreur lors de la recherche de dossiers:', error)
      return []
    }
  }


  async searchFilesByType(contentType: string): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/search/type?contentType=${encodeURIComponent(contentType)}&userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche par type')
      const files: FileDto[] = await response.json()
      return files.map(file => this.fileDtoToFileItem(file))
    } catch (error) {
      console.error('Erreur lors de la recherche par type:', error)
      return []
    }
  }

  // === APPLICATIONS SPÉCIALISÉES ===

  async findMusicFiles(): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/audio?userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche de fichiers musicaux')
      const files: FileDto[] = await response.json()
      return files.map(file => this.fileDtoToFileItem(file))
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers musicaux:', error)
      return []
    }
  }

  async findImageFiles(): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/images?userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche de fichiers images')
      const files: FileDto[] = await response.json()
      return files.map(file => this.fileDtoToFileItem(file))
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers images:', error)
      return []
    }
  }

  async findTextFiles(): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/text?userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors de la recherche de fichiers texte')
      const files: FileDto[] = await response.json()
      return files.map(file => this.fileDtoToFileItem(file))
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers texte:', error)
      return []
    }
  }

  // === UTILITAIRES ===

  async getFolderItemCount(path: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/files/count?path=${encodeURIComponent(path)}&userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors du comptage')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du comptage:', error)
      return 0
    }
  }

  // === MÉTHODES DE VÉRIFICATION (gardées pour compatibilité) ===

  private isMusicFile(file: FileItem): boolean {
    const musicExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma']
    const musicMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4', 'audio/x-ms-wma']
    
    const lastDotIndex = file.name.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? file.name.toLowerCase().substring(lastDotIndex) : ''
    return musicExtensions.includes(extension) || (!!file.mimeType && musicMimeTypes.includes(file.mimeType))
  }

  private isImageFile(file: FileItem): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff']
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff']
    
    const lastDotIndex = file.name.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? file.name.toLowerCase().substring(lastDotIndex) : ''
    return imageExtensions.includes(extension) || (!!file.mimeType && imageMimeTypes.includes(file.mimeType))
  }
}

export const fileService = new FileService() 