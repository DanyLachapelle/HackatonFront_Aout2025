import { create } from "zustand"
import type { FileItem } from "@/types/file-types"
import { fileService } from "@/services/file-service"

interface FileStore {
  files: FileItem[]
  favoriteFiles: FileItem[]
  loading: boolean
  error: string | null
  loadFiles: (path: string) => Promise<void>
  refreshFiles: () => Promise<void>
  loadFavoriteFiles: () => Promise<void>
  createFolder: (parentPath: string, name: string) => Promise<void>
  createFile: (parentPath: string, name: string, content: string) => Promise<void>
  getFileContent: (path: string) => Promise<string>
  updateFileContent: (path: string, content: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  favoriteFiles: [],
  loading: false,
  error: null,

  loadFiles: async (path: string) => {
    set({ loading: true, error: null })
    try {
      const files = await fileService.listAll(path)
      set({ files, loading: false })
    } catch (error) {
      set({ error: "Erreur lors du chargement des fichiers", loading: false })
    }
  },

  refreshFiles: async () => {
    const { files } = get()
    if (files.length > 0) {
      const currentPath = files[0]?.path?.substring(0, files[0].path.lastIndexOf("/")) || "/"
      await get().loadFiles(currentPath)
    } else {
      await get().loadFiles("/")
    }
  },

  loadFavoriteFiles: async () => {
    set({ loading: true, error: null })
    try {
      const favorites = await fileService.getFavoriteFiles()
      set({ favoriteFiles: favorites, loading: false })
    } catch (error) {
      set({ error: "Erreur lors du chargement des favoris", loading: false })
    }
  },

  createFolder: async (parentPath: string, name: string) => {
    try {
      await fileService.createFolder({
        name,
        path: parentPath,
        userId: 1
      })
      await get().loadFiles(parentPath)
    } catch (error) {
      throw new Error("Erreur lors de la création du dossier")
    }
  },

  createFile: async (parentPath: string, name: string, content: string) => {
    try {
      await fileService.createFile({
        name,
        path: parentPath,
        content,
        userId: 1
      })
      await get().loadFiles(parentPath)
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
      const parentPath = path.substring(0, path.lastIndexOf("/")) || "/"
      await get().loadFiles(parentPath)
    } catch (error) {
      throw new Error("Erreur lors de la suppression")
    }
  },
}))
