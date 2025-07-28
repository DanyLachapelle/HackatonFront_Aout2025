import { create } from "zustand"
import type { FileItem } from "@/types/file-types"
import { fileService } from "@/services/file-service"

interface FileStore {
  files: FileItem[]
  loading: boolean
  error: string | null
  loadFiles: (path: string) => Promise<void>
  createFolder: (parentPath: string, name: string) => Promise<void>
  createFile: (parentPath: string, name: string, content: string) => Promise<void>
  getFileContent: (path: string) => Promise<string>
  updateFileContent: (path: string, content: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  loading: false,
  error: null,

  loadFiles: async (path: string) => {
    set({ loading: true, error: null })
    try {
      const files = await fileService.listFiles(path)
      set({ files, loading: false })
    } catch (error) {
      set({ error: "Erreur lors du chargement des fichiers", loading: false })
    }
  },

  createFolder: async (parentPath: string, name: string) => {
    try {
      await fileService.createFolder(parentPath, name)
      // Recharger les fichiers du répertoire parent
      get().loadFiles(parentPath)
    } catch (error) {
      throw new Error("Erreur lors de la création du dossier")
    }
  },

  createFile: async (parentPath: string, name: string, content: string) => {
    try {
      await fileService.createFile(parentPath, name, content)
      // Recharger les fichiers du répertoire parent
      get().loadFiles(parentPath)
    } catch (error) {
      throw new Error("Erreur lors de la création du fichier")
    }
  },

  getFileContent: async (path: string) => {
    try {
      return await fileService.getFileContent(path)
    } catch (error) {
      throw new Error("Erreur lors de la lecture du fichier")
    }
  },

  updateFileContent: async (path: string, content: string) => {
    try {
      await fileService.updateFileContent(path, content)
    } catch (error) {
      throw new Error("Erreur lors de la sauvegarde du fichier")
    }
  },

  deleteFile: async (path: string) => {
    try {
      await fileService.deleteFile(path)
      // Recharger les fichiers du répertoire parent
      const parentPath = path.substring(0, path.lastIndexOf("/")) || "/"
      get().loadFiles(parentPath)
    } catch (error) {
      throw new Error("Erreur lors de la suppression")
    }
  },
})) 