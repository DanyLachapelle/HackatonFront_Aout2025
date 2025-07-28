import type { FileItem } from "@/types/file-types"

class FileService {
  private baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

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
            id: "3",
            name: "readme.txt",
            type: "file",
            path: "/readme.txt",
            size: 1024,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            mimeType: "text/plain",
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