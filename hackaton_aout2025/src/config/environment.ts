// Configuration de l'environnement
export const config = {
  // URL de l'API backend
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v2",
  
  // Configuration de l'application
  appName: import.meta.env.VITE_APP_NAME || "File Explorer OS",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  
  // Mode de développement
  isDev: import.meta.env.VITE_DEV_MODE === "true" || import.meta.env.DEV,
  
  // Configuration par défaut
  defaultUserId: 1,
  
  // Endpoints API
  endpoints: {
    files: "/files",
    folders: "/folders",
    search: "/search",
    upload: "/upload",
    download: "/download",
    favorites: "/favorites",
    images: "/images",
    audio: "/audio",
    text: "/text",
    calendar: "/calendar",
    events: "/events"
  }
}

// Types pour la configuration
export interface ApiConfig {
  baseUrl: string
  timeout: number
  headers: Record<string, string>
}

// Configuration API par défaut
export const apiConfig: ApiConfig = {
  baseUrl: config.apiUrl,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} 