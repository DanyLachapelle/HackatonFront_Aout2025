/**
 * Utilitaires pour les icônes de fichiers
 * Fournit des fonctions centralisées pour obtenir les icônes appropriées selon le type de fichier
 */

/**
 * Obtient l'icône emoji appropriée selon l'extension du fichier
 * @param fileName - Nom du fichier avec extension
 * @returns Emoji représentant le type de fichier
 */
export function getFileIconEmoji(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    // Documents texte
    case 'txt':
    case 'md':
    case 'rtf':
    case 'log':
      return '📄'
    
    // Images
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
    case 'ico':
    case 'tiff':
      return '🖼️'
    
    // Audio/Musique
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'm4a':
    case 'wma':
    case 'opus':
      return '🎵'
    
    // Vidéo
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
    case 'mkv':
    case 'm4v':
      return '🎬'
    
    // Code
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
      return '💻'
    
    // Documents Office
    case 'pdf':
      return '📕'
    case 'doc':
    case 'docx':
      return '📝'
    case 'xls':
    case 'xlsx':
      return '📊'
    case 'ppt':
    case 'pptx':
      return '📈'
    
    // Archives
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
      return '📦'
    
    default:
      return '📄'
  }
}

/**
 * Obtient l'icône emoji appropriée selon l'extension du fichier (version pour FileItem)
 * @param file - Objet FileItem
 * @returns Emoji représentant le type de fichier
 */
export function getFileItemIconEmoji(file: { type: string; name: string; extension?: string }): string {
  if (file.type === "folder") {
    return "📁"
  }
  
  return getFileIconEmoji(file.name)
}

/**
 * Vérifie si un fichier est une image selon son extension
 * @param fileName - Nom du fichier avec extension
 * @returns true si c'est une image
 */
export function isImageFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff'].includes(extension || '')
}

/**
 * Vérifie si un fichier est audio selon son extension
 * @param fileName - Nom du fichier avec extension
 * @returns true si c'est un fichier audio
 */
export function isAudioFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'].includes(extension || '')
}

/**
 * Vérifie si un fichier est vidéo selon son extension
 * @param fileName - Nom du fichier avec extension
 * @returns true si c'est un fichier vidéo
 */
export function isVideoFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension || '')
}

/**
 * Vérifie si un fichier est un document texte selon son extension
 * @param fileName - Nom du fichier avec extension
 * @returns true si c'est un document texte
 */
export function isTextFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return ['txt', 'md', 'rtf', 'log'].includes(extension || '')
}

/**
 * Vérifie si un fichier est un fichier de code selon son extension
 * @param fileName - Nom du fichier avec extension
 * @returns true si c'est un fichier de code
 */
export function isCodeFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return ['html', 'css', 'scss', 'sass', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'yaml', 'yml'].includes(extension || '')
} 