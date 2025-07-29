import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, X, Minimize2, Maximize2 } from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size: number
  createdAt: Date
  modifiedAt: Date
  path: string
  extension?: string
}

interface CommandHistory {
  command: string
  output: string[]
  timestamp: Date
  success: boolean
}

interface TerminalProps {
  initialPath?: string
  windowId?: string
}

export function Terminal({ initialPath = "/", windowId }: TerminalProps) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([])
  const [currentCommand, setCurrentCommand] = useState("")
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light" | "matrix">("dark")
  const [fontSize, setFontSize] = useState(14)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Système de fichiers simulé
  const fileSystem: Record<string, FileItem[]> = {
    "/": [
      { id: "1", name: "Documents", type: "folder", size: 0, createdAt: new Date(), modifiedAt: new Date(), path: "/Documents" },
      { id: "2", name: "Images", type: "folder", size: 0, createdAt: new Date(), modifiedAt: new Date(), path: "/Images" },

      { id: "4", name: "config.json", type: "file", size: 512, createdAt: new Date(), modifiedAt: new Date(), path: "/config.json", extension: "json" }
    ],
    "/Documents": [
      { id: "5", name: "rapport.pdf", type: "file", size: 2048, createdAt: new Date(), modifiedAt: new Date(), path: "/Documents/rapport.pdf", extension: "pdf" },
      { id: "6", name: "notes.txt", type: "file", size: 256, createdAt: new Date(), modifiedAt: new Date(), path: "/Documents/notes.txt", extension: "txt" }
    ],
    "/Images": [
      { id: "7", name: "photo1.jpg", type: "file", size: 3072, createdAt: new Date(), modifiedAt: new Date(), path: "/Images/photo1.jpg", extension: "jpg" },
      { id: "8", name: "photo2.png", type: "file", size: 4096, createdAt: new Date(), modifiedAt: new Date(), path: "/Images/photo2.png", extension: "png" }
    ]
  }

  const getCurrentDirectory = (): FileItem[] => {
    return fileSystem[currentPath] || []
  }

  const getCommandExamples = (command: string): string[] => {
    const examples: Record<string, string[]> = {
      ls: ["ls", "ls -la", "ls /Documents"],
      cd: ["cd Documents", "cd ..", "cd /"],
      cat: ["cat config.json"],
      pwd: ["pwd"],
      mkdir: ["mkdir nouveau_dossier"],
      touch: ["touch nouveau_fichier.txt"],
      rm: ["rm fichier.txt", "rm -r dossier"],
      clear: ["clear"],
      help: ["help"],
      date: ["date"],
      whoami: ["whoami"]
    }
    return examples[command] || []
  }

  const executeCommand = async (command: string) => {
    setIsProcessing(true)
    const output: string[] = []
    let success = true

    try {
      const parts = command.trim().split(" ")
      const cmd = parts[0].toLowerCase()
      const args = parts.slice(1)

      switch (cmd) {
        case "ls":
        case "dir":
          const files = getCurrentDirectory()
          if (files.length === 0) {
            output.push("Le répertoire est vide.")
          } else {
            files.forEach(file => {
              const icon = file.type === "folder" ? "📁" : "📄"
              const size = file.type === "folder" ? "" : ` ${file.size} bytes`
              const date = file.modifiedAt.toLocaleDateString()
              output.push(`${icon} ${file.name}${size} - ${date}`)
            })
          }
          break

        case "cd":
          if (args.length === 0) {
            setCurrentPath("/")
            output.push("Retour à la racine.")
          } else {
            const targetPath = args[0]
            if (targetPath === "..") {
              const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/"
              if (fileSystem[parentPath]) {
                setCurrentPath(parentPath)
                output.push(`Déplacement vers: ${parentPath}`)
              } else {
                output.push("Erreur: Répertoire parent non trouvé.")
                success = false
              }
            } else if (targetPath === "/") {
              setCurrentPath("/")
              output.push("Déplacement vers la racine.")
            } else {
              const newPath = currentPath === "/" ? `/${targetPath}` : `${currentPath}/${targetPath}`
              if (fileSystem[newPath]) {
                setCurrentPath(newPath)
                output.push(`Déplacement vers: ${newPath}`)
              } else {
                output.push(`Erreur: Répertoire '${targetPath}' non trouvé.`)
                success = false
              }
            }
          }
          break

        case "pwd":
          output.push(currentPath)
          break

        case "cat":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier requis.")
            success = false
          } else {
            const fileName = args[0]
            const filePath = currentPath === "/" ? `/${fileName}` : `${currentPath}/${fileName}`
            const files = getCurrentDirectory()
            const file = files.find(f => f.name === fileName)
            
            if (file && file.type === "file") {
              // Contenu simulé basé sur l'extension
              switch (file.extension) {
                case "txt":
                  output.push("Ceci est le contenu du fichier texte.")
                  output.push("Il peut contenir du texte simple.")
                  break
                case "json":
                  output.push('{')
                  output.push('  "name": "config",')
                  output.push('  "version": "1.0.0",')
                  output.push('  "enabled": true')
                  output.push('}')
                  break
                default:
                  output.push(`Contenu du fichier ${fileName}`)
              }
            } else {
              output.push(`Erreur: Fichier '${fileName}' non trouvé.`)
              success = false
            }
          }
          break

        case "mkdir":
          if (args.length === 0) {
            output.push("Erreur: Nom de dossier requis.")
            success = false
          } else {
            const folderName = args[0]
            output.push(`Dossier '${folderName}' créé avec succès.`)
            // Dans une vraie implémentation, on ajouterait le dossier au système de fichiers
          }
          break

        case "touch":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier requis.")
            success = false
          } else {
            const fileName = args[0]
            output.push(`Fichier '${fileName}' créé avec succès.`)
            // Dans une vraie implémentation, on ajouterait le fichier au système de fichiers
          }
          break

        case "rm":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier/dossier requis.")
            success = false
          } else {
            const targetName = args[0]
            output.push(`'${targetName}' supprimé avec succès.`)
            // Dans une vraie implémentation, on supprimerait l'élément du système de fichiers
          }
          break

        case "clear":
          setCommandHistory([])
          return

        case "help":
          output.push("Commandes disponibles:")
          output.push("  ls, dir          - Lister les fichiers et dossiers")
          output.push("  cd <dossier>     - Changer de répertoire")
          output.push("  pwd              - Afficher le répertoire actuel")
          output.push("  cat <fichier>    - Afficher le contenu d'un fichier")
          output.push("  mkdir <dossier>  - Créer un dossier")
          output.push("  touch <fichier>  - Créer un fichier")
          output.push("  rm <fichier>     - Supprimer un fichier/dossier")
          output.push("  clear            - Effacer l'écran")
          output.push("  date             - Afficher la date et l'heure")
          output.push("  whoami           - Afficher l'utilisateur actuel")
          output.push("  help             - Afficher cette aide")
          output.push("")
          output.push("Navigation:")
          output.push("  ↑/↓              - Parcourir l'historique des commandes")
          output.push("  Ctrl+L           - Effacer l'écran")
          break

        case "date":
          output.push(new Date().toLocaleString())
          break

        case "whoami":
          output.push("user")
          break

        case "":
          break

        default:
          output.push(`Commande '${cmd}' non reconnue. Tapez 'help' pour voir les commandes disponibles.`)
          success = false
      }
    } catch (error) {
      output.push(`Erreur: ${error}`)
      success = false
    }

    // Ajouter la commande à l'historique
    const historyEntry: CommandHistory = {
      command,
      output,
      timestamp: new Date(),
      success
    }

    setCommandHistory(prev => [...prev, historyEntry])
    setCurrentCommand("")
    setHistoryIndex(-1)
    setIsProcessing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing) {
      if (currentCommand.trim()) {
        executeCommand(currentCommand)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command)
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command)
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand("")
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault()
      setCommandHistory([])
    }
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return "📁"
    
    switch (file.extension) {
      case "txt": return "📄"
      case "json": return "⚙️"
      case "pdf": return "📕"
      case "jpg":
      case "png": return "🖼️"
      default: return "📄"
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const getThemeStyles = () => {
    switch (theme) {
      case "dark":
        return {
          background: "bg-gray-900",
          text: "text-green-400",
          border: "border-gray-700"
        }
      case "light":
        return {
          background: "bg-white",
          text: "text-gray-800",
          border: "border-gray-300"
        }
      case "matrix":
        return {
          background: "bg-black",
          text: "text-green-400",
          border: "border-green-600"
        }
    }
  }

  const themeStyles = getThemeStyles()

  return (
    <div className={`h-full flex flex-col ${themeStyles.background} ${themeStyles.text}`} style={{ fontSize: `${fontSize}px` }}>
      {/* En-tête */}
      <div className={`flex items-center justify-between p-3 border-b ${themeStyles.border}`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">💻</span>
          <span className="font-mono">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 h-8 w-8"
            title="Paramètres"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Zone de sortie */}
      <div className={`flex-1 p-4 overflow-y-auto font-mono ${themeStyles.text}`}>
        {/* Message de bienvenue */}
        {commandHistory.length === 0 && (
          <div className="mb-4">
            <div className="text-green-400">Bienvenue dans le Terminal</div>
            <div className="text-gray-500 text-sm">Tapez 'help' pour voir les commandes disponibles</div>
          </div>
        )}

        {/* Historique des commandes */}
        {commandHistory.map((entry, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center space-x-2">
              <span className={
                theme === 'dark' ? 'text-blue-400' : 
                theme === 'light' ? 'text-blue-600' : 
                'text-cyan-400'
              }>user@system</span>
              <span className={
                theme === 'dark' ? 'text-gray-500' : 
                theme === 'light' ? 'text-gray-600' : 
                'text-green-500'
              }>:</span>
              <span className={
                theme === 'dark' ? 'text-yellow-400' : 
                theme === 'light' ? 'text-yellow-600' : 
                'text-yellow-300'
              }>{currentPath}</span>
              <span className={
                theme === 'dark' ? 'text-gray-500' : 
                theme === 'light' ? 'text-gray-600' : 
                'text-green-500'
              }>$</span>
              <span className={
                theme === 'dark' ? 'text-white' : 
                theme === 'light' ? 'text-gray-800' : 
                'text-green-300'
              }>{entry.command}</span>
            </div>
            {entry.output.length > 0 && (
              <div className="mt-1 ml-4">
                {entry.output.map((line, lineIndex) => (
                  <div 
                    key={lineIndex} 
                    className={
                      entry.success 
                        ? (theme === 'dark' ? 'text-green-400' : 
                           theme === 'light' ? 'text-green-700' : 
                           'text-green-400')
                        : (theme === 'dark' ? 'text-red-400' : 
                           theme === 'light' ? 'text-red-600' : 
                           'text-red-400')
                    }
                    style={theme === 'matrix' ? { textShadow: '0 0 3px currentColor' } : {}}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Ligne de commande actuelle */}
        <div className="flex items-center space-x-2">
          <span className={
            theme === 'dark' ? 'text-blue-400' : 
            theme === 'light' ? 'text-blue-600' : 
            'text-cyan-400'
          }>user@system</span>
          <span className={
            theme === 'dark' ? 'text-gray-500' : 
            theme === 'light' ? 'text-gray-600' : 
            'text-green-500'
          }>:</span>
          <span className={
            theme === 'dark' ? 'text-yellow-400' : 
            theme === 'light' ? 'text-yellow-600' : 
            'text-yellow-300'
          }>{currentPath}</span>
          <span className={
            theme === 'dark' ? 'text-gray-500' : 
            theme === 'light' ? 'text-gray-600' : 
            'text-green-500'
          }>$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent outline-none border-none ${
              theme === 'dark' ? 'text-white' : 
              theme === 'light' ? 'text-gray-800' : 
              'text-green-300'
            }`}
            placeholder="Tapez une commande..."
            disabled={isProcessing}
            style={theme === 'matrix' ? { textShadow: '0 0 3px #00ff00' } : {}}
          />
          {isProcessing && (
            <div className={`animate-spin w-4 h-4 border-2 border-t-transparent rounded-full ${
              theme === 'dark' ? 'border-green-400' : 
              theme === 'light' ? 'border-green-600' : 
              'border-green-400'
            }`} style={theme === 'matrix' ? { boxShadow: '0 0 5px #00ff00' } : {}}></div>
          )}
        </div>
      </div>

      {/* Paramètres */}
      {showSettings && (
        <div className={`p-4 border-t ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : theme === 'light'
            ? 'bg-gray-100 border-gray-300'
            : 'bg-black border-green-600'
        }`}>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 
                theme === 'light' ? 'text-gray-800' : 
                'text-green-400'
              }`}>Thème</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "dark" | "light" | "matrix")}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-800'
                    : 'bg-black border-green-600 text-green-400'
                }`}
              >
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
                <option value="matrix">Matrix</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 
                theme === 'light' ? 'text-gray-800' : 
                'text-green-400'
              }`}>Taille de police</label>
              <input
                type="range"
                min="10"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">{fontSize}px</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}