export interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  size: number
  createdAt: string
  modifiedAt: string
  mimeType?: string
  extension?: string
  parentId?: string
  isFavorite?: boolean
  folderId?: number
  folderName?: string
  folderPath?: string
  userId?: number
  username?: string
}

export interface CreateFileRequest {
  name: string
  type: "file" | "folder"
  parentPath: string
  content?: string
  userId?: number
}

export interface UpdateFileRequest {
  content: string
}

// Types pour les DTOs du backend
export interface FileDto {
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

export interface FolderDto {
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

export interface BackendCreateFileRequest {
  parentPath: string
  name: string
  content: string
  userId: number
}

export interface BackendCreateFolderRequest {
  parentPath: string
  name: string
  userId: number
} 