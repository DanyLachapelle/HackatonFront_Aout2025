export interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  size: number
  createdAt: string
  modifiedAt: string
  mimeType?: string
  parentId?: string
}

export interface CreateFileRequest {
  name: string
  type: "file" | "folder"
  parentPath: string
  content?: string
}

export interface UpdateFileRequest {
  content: string
} 