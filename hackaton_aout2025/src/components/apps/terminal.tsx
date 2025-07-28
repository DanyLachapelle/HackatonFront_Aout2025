import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  TerminalIcon,
  FolderIcon,
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileArchiveIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileCodeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon,
  TrashIcon,
  CopyIcon,
  DownloadIcon,
  UploadIcon,
  SearchIcon,
  SettingsIcon,
  InfoIcon,
  EditIcon,
  EyeIcon,
  ArchiveIcon,
  FolderPlusIcon,
  FilePlusIcon,
  RotateCcwIcon,
  XIcon,
  MaximizeIcon,
  MinimizeIcon
} from "lucide-react"

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
}

export function Terminal({ initialPath = "/" }: TerminalProps) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([])
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandIndex, setCommandIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [terminalSize, setTerminalSize] = useState({ rows: 25, cols: 80 })
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light" | "matrix">("dark")
  const [fontSize, setFontSize] = useState(14)

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Données d'exemple pour simuler un système de fichiers (même que l'explorateur)
  const mockFileSystem: Record<string, FileItem[]> = {
    "/": [
      {
        id: "1",
        name: "Documents",
        type: "folder",
        size: 0,
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-15"),
        path: "/Documents"
      },
      {
        id: "2",
        name: "Images",
        type: "folder",
        size: 0,
        createdAt: new Date("2024-01-02"),
        modifiedAt: new Date("2024-01-20"),
        path: "/Images"
      },
      {
        id: "3",
        name: "Téléchargements",
        type: "folder",
        size: 0,
        createdAt: new Date("2024-01-03"),
        modifiedAt: new Date("2024-01-25"),
        path: "/Téléchargements"
      },
      {
        id: "4",
        name: "readme.txt",
        type: "file",
        size: 2048,
        createdAt: new Date("2024-01-10"),
        modifiedAt: new Date("2024-01-10"),
        path: "/readme.txt",
        extension: "txt"
      },
      {
        id: "5",
        name: "config.json",
        type: "file",
        size: 512,
        createdAt: new Date("2024-01-05"),
        modifiedAt: new Date("2024-01-12"),
        path: "/config.json",
        extension: "json"
      }
    ],
    "/Documents": [
      {
        id: "6",
        name: "rapport.pdf",
        type: "file",
        size: 1048576,
        createdAt: new Date("2024-01-15"),
        modifiedAt: new Date("2024-01-15"),
        path: "/Documents/rapport.pdf",
        extension: "pdf"
      },
      {
        id: "7",
        name: "notes.txt",
        type: "file",
        size: 1024,
        createdAt: new Date("2024-01-16"),
        modifiedAt: new Date("2024-01-16"),
        path: "/Documents/notes.txt",
        extension: "txt"
      },
      {
        id: "8",
        name: "Projets",
        type: "folder",
        size: 0,
        createdAt: new Date("2024-01-17"),
        modifiedAt: new Date("2024-01-17"),
        path: "/Documents/Projets"
      }
    ],
    "/Images": [
      {
        id: "9",
        name: "photo1.jpg",
        type: "file",
        size: 2097152,
        createdAt: new Date("2024-01-20"),
        modifiedAt: new Date("2024-01-20"),
        path: "/Images/photo1.jpg",
        extension: "jpg"
      },
      {
        id: "10",
        name: "screenshot.png",
        type: "file",
        size: 524288,
        createdAt: new Date("2024-01-21"),
        modifiedAt: new Date("2024-01-21"),
        path: "/Images/screenshot.png",
        extension: "png"
      }
    ],
    "/Téléchargements": [
      {
        id: "11",
        name: "document.zip",
        type: "file",
        size: 15728640,
        createdAt: new Date("2024-01-25"),
        modifiedAt: new Date("2024-01-25"),
        path: "/Téléchargements/document.zip",
        extension: "zip"
      }
    ],
    "/Documents/Projets": [
      {
        id: "12",
        name: "projet1.html",
        type: "file",
        size: 4096,
        createdAt: new Date("2024-01-17"),
        modifiedAt: new Date("2024-01-17"),
        path: "/Documents/Projets/projet1.html",
        extension: "html"
      },
      {
        id: "13",
        name: "style.css",
        type: "file",
        size: 2048,
        createdAt: new Date("2024-01-17"),
        modifiedAt: new Date("2024-01-17"),
        path: "/Documents/Projets/style.css",
        extension: "css"
      }
    ]
  }

  // Commandes disponibles
  const commands = {
    help: {
      description: "Affiche la liste des commandes disponibles",
      usage: "help [commande]",
      execute: (args: string[]) => {
        if (args.length === 0) {
          return [
            "Commandes disponibles :",
            "",
            "Navigation :",
            "  cd <dossier>     - Changer de répertoire",
            "  pwd              - Afficher le répertoire actuel",
            "  ls [options]     - Lister les fichiers et dossiers",
            "",
            "Fichiers :",
            "  cat <fichier>    - Afficher le contenu d'un fichier",
            "  touch <fichier>  - Créer un fichier vide",
            "  mkdir <dossier>  - Créer un dossier",
            "  rm <fichier>     - Supprimer un fichier",
            "  rmdir <dossier>  - Supprimer un dossier vide",
            "",
            "Système :",
            "  clear            - Effacer l'écran",
            "  date             - Afficher la date et l'heure",
            "  whoami           - Afficher l'utilisateur actuel",
            "  history          - Afficher l'historique des commandes",
            "",
            "Utilisation : help <commande> pour plus d'informations"
          ]
        } else {
          const command = args[0]
          const cmdInfo = commands[command as keyof typeof commands]
          if (cmdInfo) {
            return [
              `Commande : ${command}`,
              `Description : ${cmdInfo.description}`,
              `Usage : ${cmdInfo.usage}`,
              "",
              "Exemples :",
              ...getCommandExamples(command)
            ]
          } else {
            return [`Commande '${command}' non trouvée. Tapez 'help' pour voir toutes les commandes.`]
          }
        }
      }
    },
    ls: {
      description: "Lister les fichiers et dossiers",
      usage: "ls [-l] [-a] [dossier]",
      execute: (args: string[]) => {
        const options = args.filter(arg => arg.startsWith('-'))
        const paths = args.filter(arg => !arg.startsWith('-'))
        const path = paths[0] || currentPath
        const showDetails = options.includes('-l')
        const showHidden = options.includes('-a')

        const files = mockFileSystem[path] || []
        const filteredFiles = showHidden ? files : files.filter(f => !f.name.startsWith('.'))

        if (showDetails) {
          return [
            `total ${filteredFiles.length}`,
            "",
            ...filteredFiles.map(file => {
              const type = file.type === "folder" ? "d" : "-"
              const size = file.type === "folder" ? "0" : file.size.toString()
              const date = file.modifiedAt.toLocaleDateString("fr-FR", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })
              return `${type}rw-r--r-- 1 user user ${size.padStart(8)} ${date} ${file.name}`
            })
          ]
        } else {
          return filteredFiles.map(file => file.name)
        }
      }
    },
    cd: {
      description: "Changer de répertoire",
      usage: "cd <dossier>",
      execute: (args: string[]) => {
        if (args.length === 0) {
          setCurrentPath("/")
          return ["Retour à la racine"]
        }

        const target = args[0]
        let newPath = currentPath

        if (target === "..") {
          const parts = currentPath.split("/").filter(Boolean)
          if (parts.length > 0) {
            parts.pop()
            newPath = "/" + parts.join("/")
          }
        } else if (target === ".") {
          newPath = currentPath
        } else if (target.startsWith("/")) {
          newPath = target
        } else {
          newPath = currentPath === "/" ? `/${target}` : `${currentPath}/${target}`
        }

        if (mockFileSystem[newPath]) {
          setCurrentPath(newPath)
          return [`Répertoire changé vers : ${newPath}`]
        } else {
          return [`Erreur : Le répertoire '${target}' n'existe pas`]
        }
      }
    },
    pwd: {
      description: "Afficher le répertoire de travail actuel",
      usage: "pwd",
      execute: () => [currentPath]
    },
    cat: {
      description: "Afficher le contenu d'un fichier",
      usage: "cat <fichier>",
      execute: (args: string[]) => {
        if (args.length === 0) {
          return ["Erreur : Nom de fichier requis"]
        }

        const fileName = args[0]
        const filePath = fileName.startsWith("/") ? fileName : `${currentPath}/${fileName}`
        const files = mockFileSystem[currentPath] || []
        const file = files.find(f => f.name === fileName)

        if (!file || file.type === "folder") {
          return [`Erreur : Le fichier '${fileName}' n'existe pas`]
        }

        // Contenu simulé selon le type de fichier
        switch (file.extension) {
          case "txt":
            return [
              `Contenu du fichier ${fileName} :`,
              "",
              "Ceci est un fichier texte d'exemple.",
              "Il contient du contenu simulé pour la démonstration.",
              "",
              "Ligne 1 : Bonjour le monde !",
              "Ligne 2 : Ce terminal fonctionne parfaitement.",
              "Ligne 3 : Prêt pour l'intégration backend."
            ]
          case "json":
            return [
              `Contenu du fichier ${fileName} :`,
              "",
              "{",
              '  "name": "terminal-app",',
              '  "version": "1.0.0",',
              '  "description": "Terminal interactif",',
              '  "author": "Développeur",',
              '  "dependencies": {',
              '    "react": "^18.0.0"',
              "  }",
              "}"
            ]
          case "html":
            return [
              `Contenu du fichier ${fileName} :`,
              "",
              "<!DOCTYPE html>",
              "<html>",
              "<head>",
              '    <title>Page d\'exemple</title>',
              "</head>",
              "<body>",
              "    <h1>Bienvenue</h1>",
              "    <p>Ceci est une page HTML d'exemple.</p>",
              "</body>",
              "</html>"
            ]
          default:
            return [
              `Contenu du fichier ${fileName} :`,
              "",
              "Contenu binaire ou format non supporté.",
              `Taille : ${file.size} octets`
            ]
        }
      }
    },
    touch: {
      description: "Créer un fichier vide",
      usage: "touch <fichier>",
      execute: (args: string[]) => {
        if (args.length === 0) {
          return ["Erreur : Nom de fichier requis"]
        }

        const fileName = args[0]
        const newFile: FileItem = {
          id: Date.now().toString(),
          name: fileName,
          type: "file",
          size: 0,
          createdAt: new Date(),
          modifiedAt: new Date(),
          path: `${currentPath}/${fileName}`,
          extension: fileName.includes(".") ? fileName.split(".").pop() : undefined
        }

        // Simuler l'ajout au système de fichiers
        if (!mockFileSystem[currentPath]) {
          mockFileSystem[currentPath] = []
        }
        mockFileSystem[currentPath].push(newFile)

        return [`Fichier '${fileName}' créé`]
      }
    },
    mkdir: {
      description: "Créer un dossier",
      usage: "mkdir <dossier>",
      execute: (args: string[]) => {
        if (args.length === 0) {
          return ["Erreur : Nom de dossier requis"]
        }

        const folderName = args[0]
        const newFolder: FileItem = {
          id: Date.now().toString(),
          name: folderName,
          type: "folder",
          size: 0,
          createdAt: new Date(),
          modifiedAt: new Date(),
          path: `${currentPath}/${folderName}`
        }

        // Simuler l'ajout au système de fichiers
        if (!mockFileSystem[currentPath]) {
          mockFileSystem[currentPath] = []
        }
        mockFileSystem[currentPath].push(newFolder)
        mockFileSystem[newFolder.path] = []

        return [`Dossier '${folderName}' créé`]
      }
    },
    rm: {
      description: "Supprimer un fichier",
      usage: "rm <fichier>",
      execute: (args: string[]) => {
        if (args.length === 0) {
          return ["Erreur : Nom de fichier requis"]
        }

        const fileName = args[0]
        const files = mockFileSystem[currentPath] || []
        const fileIndex = files.findIndex(f => f.name === fileName && f.type === "file")

        if (fileIndex === -1) {
          return [`Erreur : Le fichier '${fileName}' n'existe pas`]
        }

        files.splice(fileIndex, 1)
        return [`Fichier '${fileName}' supprimé`]
      }
    },
    rmdir: {
      description: "Supprimer un dossier vide",
      usage: "rmdir <dossier>",
      execute: (args: string[]) => {
        if (args.length === 0) {
          return ["Erreur : Nom de dossier requis"]
        }

        const folderName = args[0]
        const files = mockFileSystem[currentPath] || []
        const folderIndex = files.findIndex(f => f.name === folderName && f.type === "folder")

        if (folderIndex === -1) {
          return [`Erreur : Le dossier '${folderName}' n'existe pas`]
        }

        const folderPath = `${currentPath}/${folderName}`
        const folderContents = mockFileSystem[folderPath] || []

        if (folderContents.length > 0) {
          return [`Erreur : Le dossier '${folderName}' n'est pas vide`]
        }

        files.splice(folderIndex, 1)
        delete mockFileSystem[folderPath]
        return [`Dossier '${folderName}' supprimé`]
      }
    },
    clear: {
      description: "Effacer l'écran",
      usage: "clear",
      execute: () => {
        setCommandHistory([])
        return []
      }
    },
    date: {
      description: "Afficher la date et l'heure",
      usage: "date",
      execute: () => [new Date().toLocaleString("fr-FR")]
    },
    whoami: {
      description: "Afficher l'utilisateur actuel",
      usage: "whoami",
      execute: () => ["user"]
    },
    history: {
      description: "Afficher l'historique des commandes",
      usage: "history",
      execute: () => {
        return commandHistory.map((entry, index) => 
          `${index + 1}  ${entry.timestamp.toLocaleTimeString()}  ${entry.command}`
        )
      }
    }
  }

  const getCommandExamples = (command: string): string[] => {
    switch (command) {
      case "ls":
        return ["ls", "ls -l", "ls -a", "ls Documents"]
      case "cd":
        return ["cd Documents", "cd ..", "cd /"]
      case "cat":
        return ["cat readme.txt", "cat config.json"]
      case "touch":
        return ["touch nouveau.txt", "touch fichier.js"]
      case "mkdir":
        return ["mkdir nouveau_dossier", "mkdir projets"]
      case "rm":
        return ["rm fichier.txt", "rm ancien.js"]
      case "rmdir":
        return ["rmdir dossier_vide"]
      default:
        return []
    }
  }

  const executeCommand = async (command: string) => {
    setIsProcessing(true)
    
    const trimmedCommand = command.trim()
    if (!trimmedCommand) {
      setIsProcessing(false)
      return
    }

    const parts = trimmedCommand.split(" ")
    const commandName = parts[0].toLowerCase()
    const args = parts.slice(1)

    let output: string[] = []
    let success = true

    try {
      if (commands[commandName as keyof typeof commands]) {
        output = commands[commandName as keyof typeof commands].execute(args)
      } else {
        output = [`Commande '${commandName}' non trouvée. Tapez 'help' pour voir toutes les commandes.`]
        success = false
      }
    } catch (error) {
      output = [`Erreur lors de l'exécution : ${error}`]
      success = false
    }

    const historyEntry: CommandHistory = {
      command: trimmedCommand,
      output,
      timestamp: new Date(),
      success
    }

    setCommandHistory(prev => [...prev, historyEntry])
    setCurrentCommand("")
    setCommandIndex(-1)
    setIsProcessing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      executeCommand(currentCommand)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandIndex < commandHistory.length - 1) {
        const newIndex = commandIndex + 1
        setCommandIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command)
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (commandIndex > 0) {
        const newIndex = commandIndex - 1
        setCommandIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command)
      } else if (commandIndex === 0) {
        setCommandIndex(-1)
        setCurrentCommand("")
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commandHistory])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return <FolderIcon className="w-4 h-4 text-blue-500" />
    
    const extension = file.extension?.toLowerCase()
    switch (extension) {
      case "txt":
      case "md":
      case "pdf":
        return <FileTextIcon className="w-4 h-4 text-gray-600" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return <FileImageIcon className="w-4 h-4 text-green-500" />
      case "zip":
      case "rar":
      case "7z":
        return <FileArchiveIcon className="w-4 h-4 text-orange-500" />
      case "mp4":
      case "avi":
      case "mov":
        return <FileVideoIcon className="w-4 h-4 text-purple-500" />
      case "mp3":
      case "wav":
      case "flac":
        return <FileAudioIcon className="w-4 h-4 text-pink-500" />
      case "html":
      case "css":
      case "js":
      case "ts":
      case "json":
        return <FileCodeIcon className="w-4 h-4 text-blue-600" />
      default:
        return <FileIcon className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Barre d'outils */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : theme === 'light' ? 'bg-gray-200' : 'bg-black'} border-b ${theme === 'dark' ? 'border-gray-700' : theme === 'light' ? 'border-gray-300' : 'border-green-600'} p-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TerminalIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
            <span className={`font-mono text-sm ${theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-gray-800' : 'text-green-400'}`}>Terminal</span>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : theme === 'light' ? 'text-gray-600' : 'text-green-500'}`}>user@system</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-green-500 hover:text-green-300'}`}
              title="Paramètres du terminal"
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandHistory([])}
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-green-500 hover:text-green-300'}`}
              title="Effacer l'historique"
            >
              <RotateCcwIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Zone du terminal */}
      <div 
        ref={terminalRef}
        className={`flex-1 font-mono text-sm overflow-auto p-4 ${
          theme === 'dark' 
            ? 'bg-black text-green-400' 
            : theme === 'light'
            ? 'bg-white text-green-700 border border-gray-300'
            : 'bg-black text-green-400 border border-green-600'
        }`}
        style={{ 
          fontSize: `${fontSize}px`,
          ...(theme === 'matrix' && {
            background: 'linear-gradient(135deg, #000000 0%, #001a00 50%, #000000 100%)',
            textShadow: '0 0 5px #00ff00'
          })
        }}
      >
        {/* Historique des commandes */}
        {commandHistory.map((entry, index) => (
          <div key={index} className="mb-2">
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
                className={`w-full p-2 border rounded ${
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
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 
                theme === 'light' ? 'text-gray-600' : 
                'text-green-500'
              }`}>{fontSize}px</span>
            </div>
          </div>
        </div>
      )}

      {/* Barre de statut */}
      <div className={`border-t p-2 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : theme === 'light'
          ? 'bg-gray-200 border-gray-300'
          : 'bg-black border-green-600'
      }`}>
        <div className={`flex items-center justify-between text-xs ${
          theme === 'dark' ? 'text-gray-400' : 
          theme === 'light' ? 'text-gray-600' : 
          'text-green-500'
        }`}>
          <div className="flex items-center space-x-4">
            <span>Ligne: {commandHistory.length + 1}</span>
            <span>Colonne: {currentCommand.length + 1}</span>
            <span>Répertoire: {currentPath}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Utilisateur: user</span>
            <span>Terminal: xterm-256color</span>
          </div>
        </div>
      </div>
    </div>
  )
} 