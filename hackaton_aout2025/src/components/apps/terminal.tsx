import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, X, Minimize2, Maximize2 } from "lucide-react"
import { getFileItemIconEmoji } from "@/lib/file-icons"
import { fileService } from "@/services/file-service"
import type { FileItem } from "@/types/file-types"

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
  const [currentDirectoryFiles, setCurrentDirectoryFiles] = useState<FileItem[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Charger les fichiers du répertoire actuel
  const loadCurrentDirectory = async () => {
    try {
      const files = await fileService.listAll(currentPath)
      setCurrentDirectoryFiles(files)
    } catch (error) {
      console.error('Erreur lors du chargement du répertoire:', error)
      setCurrentDirectoryFiles([])
    }
  }

  // Charger les fichiers quand le chemin change
  useEffect(() => {
    loadCurrentDirectory()
  }, [currentPath])

  const getCurrentDirectory = (): FileItem[] => {
    return currentDirectoryFiles
  }

  // Fonction utilitaire pour formater la taille des fichiers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 bytes"
    const k = 1024
    const sizes = ["bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Fonction pour exécuter une commande dans le contexte d'un script (sans ajouter à l'historique)
  const executeScriptCommand = async (command: string, output: string[]) => {
    const parts = command.trim().split(" ")
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (cmd) {
      case "echo":
        if (args.length === 0) {
          output.push("")
        } else {
          output.push(args.join(" "))
        }
        break

      case "ls":
      case "dir":
        const currentFiles = getCurrentDirectory()
        if (currentFiles.length === 0) {
          output.push("Le répertoire est vide.")
        } else {
          const sortedFiles = currentFiles.sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "folder" ? -1 : 1
            }
            return a.name.localeCompare(b.name)
          })
          
          sortedFiles.forEach(file => {
            const icon = file.type === "folder" ? "📁" : "📄"
            const size = file.type === "folder" ? "" : ` ${file.size} bytes`
            const date = typeof file.modifiedAt === 'string' ? new Date(file.modifiedAt).toLocaleDateString() : file.modifiedAt.toLocaleDateString()
            output.push(`${icon} ${file.name}${size} - ${date}`)
          })
        }
        break

      case "pwd":
        output.push(currentPath)
        break

      case "mkdir":
        if (args.length === 0) {
          output.push("Erreur: Nom de dossier requis.")
        } else {
          const folderName = args[0]
          try {
            await fileService.createFolder(currentPath, folderName)
            output.push(`Dossier '${folderName}' créé avec succès.`)
            await loadCurrentDirectory()
          } catch (error) {
            output.push(`Erreur lors de la création du dossier: ${error}`)
          }
        }
        break

      case "touch":
        if (args.length === 0) {
          output.push("Erreur: Nom de fichier requis.")
        } else {
          const fileName = args[0]
          try {
            let finalFileName = fileName
            // Préserver l'extension originale ou ajouter .txt par défaut si aucune extension
            const hasExtension = finalFileName.includes('.')
            if (!hasExtension) {
              finalFileName += '.txt'
            }
            await fileService.createFile(currentPath, finalFileName, "")
            output.push(`Fichier '${finalFileName}' créé avec succès.`)
            await loadCurrentDirectory()
          } catch (error) {
            output.push(`Erreur lors de la création du fichier: ${error}`)
          }
        }
        break

      case "date":
        output.push(new Date().toLocaleString())
        break

      case "whoami":
        output.push("user")
        break

      default:
        output.push(`Commande '${cmd}' non reconnue dans le contexte du script.`)
    }
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

      // Gestion spéciale pour les scripts exécutables (./script.sh)
      if (cmd.startsWith('./')) {
        const scriptName = cmd.substring(2) // Enlever le ./
        const scriptArgs = args
        const files = getCurrentDirectory()
        const scriptFile = files.find(f => f.name === scriptName)
        
        if (scriptFile && scriptFile.type === "file") {
          try {
            const scriptContent = await fileService.getFileContent(scriptFile.path)
            output.push(`=== Exécution du script: ${scriptName} ===`)
            output.push(`Arguments: ${scriptArgs.join(' ')}`)
            output.push("")
            
            // Parser et exécuter le script ligne par ligne
            const lines = scriptContent.split('\n')
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim()
              
              // Ignorer les lignes vides et les commentaires
              if (line === '' || line.startsWith('#')) {
                continue
              }
              
              // Remplacer les variables d'arguments ($1, $2, etc.)
              let processedLine = line
              scriptArgs.forEach((arg, index) => {
                processedLine = processedLine.replace(new RegExp(`\\$${index + 1}`, 'g'), arg)
              })
              
              // Remplacer les variables d'environnement
              processedLine = processedLine.replace(/\$PWD/g, currentPath)
              processedLine = processedLine.replace(/\$USER/g, 'user')
              processedLine = processedLine.replace(/\$\@/g, scriptArgs.join(' '))
              
              output.push(`[Ligne ${i + 1}] ${processedLine}`)
              
              // Exécuter la commande
              if (processedLine.trim()) {
                try {
                  await executeScriptCommand(processedLine, output)
                } catch (error) {
                  output.push(`Erreur à la ligne ${i + 1}: ${error}`)
                  success = false
                }
              }
            }
            
            output.push("=== Fin de l'exécution du script ===")
          } catch (error) {
            output.push(`Erreur lors de la lecture du script: ${error}`)
            success = false
          }
        } else {
          output.push(`Erreur: Script '${scriptName}' non trouvé.`)
          success = false
        }
        return
      }

      switch (cmd) {
        case "ls":
        case "dir":
          const currentFiles = getCurrentDirectory()
          if (currentFiles.length === 0) {
            output.push("Le répertoire est vide.")
          } else {
            // Trier les fichiers : dossiers d'abord, puis fichiers
            const sortedFiles = currentFiles.sort((a, b) => {
              if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1
              }
              return a.name.localeCompare(b.name)
            })
            
            sortedFiles.forEach(file => {
              const icon = file.type === "folder" ? "📁" : "📄"
              const size = file.type === "folder" ? "" : ` ${file.size} bytes`
              const date = typeof file.modifiedAt === 'string' ? new Date(file.modifiedAt).toLocaleDateString() : file.modifiedAt.toLocaleDateString()
              output.push(`${icon} ${file.name}${size} - ${date}`)
            })
          }
          break

        case "bash":
        case "sh":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier bash requis.")
            output.push("Usage: bash <script.sh> [arguments...]")
            output.push("Usage: sh <script.sh> [arguments...]")
            success = false
          } else {
            const scriptName = args[0]
            const scriptArgs = args.slice(1)
            const files = getCurrentDirectory()
            const scriptFile = files.find(f => f.name === scriptName)
            
            if (scriptFile && scriptFile.type === "file") {
              try {
                const scriptContent = await fileService.getFileContent(scriptFile.path)
                output.push(`=== Exécution du script: ${scriptName} ===`)
                output.push(`Arguments: ${scriptArgs.join(' ')}`)
                output.push("")
                
                // Parser et exécuter le script ligne par ligne
                const lines = scriptContent.split('\n')
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i].trim()
                  
                  // Ignorer les lignes vides et les commentaires
                  if (line === '' || line.startsWith('#')) {
                    continue
                  }
                  
                  // Remplacer les variables d'arguments ($1, $2, etc.)
                  let processedLine = line
                  scriptArgs.forEach((arg, index) => {
                    processedLine = processedLine.replace(new RegExp(`\\$${index + 1}`, 'g'), arg)
                  })
                  
                  // Remplacer les variables d'environnement
                  processedLine = processedLine.replace(/\$PWD/g, currentPath)
                  processedLine = processedLine.replace(/\$USER/g, 'user')
                  processedLine = processedLine.replace(/\$\@/g, scriptArgs.join(' '))
                  
                  // Afficher la ligne qui va être exécutée
                  output.push(`[Ligne ${i + 1}] ${processedLine}`)
                  
                  // Exécuter la commande sans l'ajouter à l'historique
                  if (processedLine.trim()) {
                    try {
                      // Exécuter directement sans passer par executeCommand pour éviter la double exécution
                      await executeScriptCommand(processedLine, output)
                    } catch (error) {
                      output.push(`Erreur à la ligne ${i + 1}: ${error}`)
                      success = false
                    }
                  }
                }
                
                output.push("=== Fin de l'exécution du script ===")
              } catch (error) {
                output.push(`Erreur lors de la lecture du script: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: Script '${scriptName}' non trouvé.`)
              success = false
            }
          }
          break

        case "script":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier requis.")
            output.push("Usage: script <nom>")
            output.push("Crée un nouveau script bash avec des commandes de base.")
            success = false
          } else {
            const scriptName = args[0]
            if (!scriptName.toLowerCase().endsWith('.sh')) {
              const finalName = scriptName + '.sh'
              try {
                const defaultScript = `#!/bin/bash
# Script généré automatiquement
# Usage: bash ${finalName}

echo "Script ${finalName} exécuté avec succès!"
echo "Répertoire actuel: \$PWD"
echo "Utilisateur: \$USER"
echo "Arguments reçus: \$@"

# Ajoutez vos commandes ici
# Exemple:
# ls -la
# echo "Hello World"
`
                await fileService.createFile(currentPath, finalName, defaultScript)
                output.push(`Script '${finalName}' créé avec succès.`)
                output.push("Vous pouvez maintenant l'éditer et l'exécuter avec 'bash ${finalName}'")
                await loadCurrentDirectory()
              } catch (error) {
                output.push(`Erreur lors de la création du script: ${error}`)
                success = false
              }
            } else {
              output.push("Erreur: Le nom du script doit se terminer par .sh")
              success = false
            }
          }
          break

        case "cd":
          if (args.length === 0) {
            setCurrentPath("/")
            output.push("Retour à la racine.")
          } else {
            const targetPath = args[0]
            if (targetPath === "..") {
              // Gestion spéciale pour les dossiers système
              if (currentPath === "/bureau") {
                setCurrentPath("/")
                output.push("Déplacement vers: /")
              } else if (currentPath === "/documents") {
                setCurrentPath("/")
                output.push("Déplacement vers: /")
              } else if (currentPath === "/images") {
                setCurrentPath("/")
                output.push("Déplacement vers: /")
              } else if (currentPath === "/musique") {
                setCurrentPath("/")
                output.push("Déplacement vers: /")
              } else if (currentPath === "/") {
                output.push("Vous êtes déjà à la racine.")
                success = false
              } else {
                // Pour les autres dossiers, utiliser la logique normale
                const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/"
                setCurrentPath(parentPath)
                output.push(`Déplacement vers: ${parentPath}`)
              }
            } else if (targetPath === "/") {
              setCurrentPath("/")
              output.push("Déplacement vers la racine.")
            } else {
              const newPath = currentPath === "/" ? `/${targetPath}` : `${currentPath}/${targetPath}`
              if (newPath.startsWith("/")) { // Assurer que le chemin est absolu
                // Vérifier si le dossier existe
                try {
                  const files = await fileService.listAll(newPath)
                  // Si on arrive ici, le dossier existe
                  setCurrentPath(newPath)
                  output.push(`Déplacement vers: ${newPath}`)
                } catch (error) {
                  output.push(`Erreur: Répertoire '${targetPath}' non trouvé.`)
                  success = false
                }
              } else {
                output.push(`Erreur: Chemin relatif non autorisé: ${targetPath}`)
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
            const files = getCurrentDirectory()
            const file = files.find(f => f.name === fileName)
            
            if (file && file.type === "file") {
              try {
                const content = await fileService.getFileContent(file.path)
                const lines = content.split('\n')
                lines.forEach(line => output.push(line))
              } catch (error) {
                output.push(`Erreur lors de la lecture du fichier: ${error}`)
                success = false
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
            try {
              await fileService.createFolder(currentPath, folderName)
              output.push(`Dossier '${folderName}' créé avec succès.`)
              // Recharger le répertoire
              await loadCurrentDirectory()
            } catch (error) {
              output.push(`Erreur lors de la création du dossier: ${error}`)
              success = false
            }
          }
          break

        case "touch":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier requis.")
            success = false
          } else {
            const fileName = args[0]
            try {
              // Préserver l'extension originale ou ajouter .txt par défaut si aucune extension
              let finalFileName = fileName
              const hasExtension = finalFileName.includes('.')
              if (!hasExtension) {
                finalFileName += '.txt'
              }
              await fileService.createFile(currentPath, finalFileName, "")
              output.push(`Fichier '${finalFileName}' créé avec succès.`)
              // Recharger le répertoire
              await loadCurrentDirectory()
            } catch (error) {
              output.push(`Erreur lors de la création du fichier: ${error}`)
              success = false
            }
          }
          break

        case "rm":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier/dossier requis.")
            success = false
          } else {
            const targetName = args[0]
            const files = getCurrentDirectory()
            const target = files.find(f => f.name === targetName)
            
            if (target) {
              try {
                if (target.type === "folder") {
                  await fileService.deleteFolder(target.id)
                } else {
                  await fileService.deleteFileById(target.id)
                }
                output.push(`'${targetName}' supprimé avec succès.`)
                // Recharger le répertoire
                await loadCurrentDirectory()
              } catch (error) {
                output.push(`Erreur lors de la suppression: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: '${targetName}' non trouvé.`)
              success = false
            }
          }
          break

        case "clear":
          setCommandHistory([])
          return

        case "help":
          output.push("Commandes disponibles:")
          output.push("  ls, dir          - Lister les fichiers et dossiers")
          output.push("  ll, la           - Lister avec détails (permissions, taille)")
          output.push("  cd <dossier>     - Changer de répertoire")
          output.push("  pwd              - Afficher le répertoire actuel")
          output.push("  cat <fichier>    - Afficher le contenu d'un fichier")
          output.push("  head <fichier>   - Afficher les premières lignes")
          output.push("  tail <fichier>   - Afficher les dernières lignes")
          output.push("  grep <motif> <fichier> - Rechercher du texte dans un fichier")
          output.push("  mkdir <dossier>  - Créer un dossier")
          output.push("  touch <fichier>  - Créer un fichier")
          output.push("  cp <source> <dest> - Copier un fichier/dossier")
          output.push("  mv <source> <dest> - Déplacer un fichier/dossier")
          output.push("  rm <fichier>     - Supprimer un fichier/dossier")
          output.push("  tree             - Afficher l'arborescence")
          output.push("  find <nom>       - Rechercher des fichiers/dossiers")
          output.push("  du               - Afficher la taille des fichiers")
          output.push("  stat <nom>       - Informations détaillées sur un fichier")
          output.push("  echo <texte>     - Afficher du texte")
          output.push("  wc <fichier>     - Compter lignes, mots, caractères")
          output.push("  history          - Afficher l'historique des commandes")
          output.push("  alias            - Afficher les alias disponibles")
          output.push("  bash <script.sh> - Exécuter un script bash")
          output.push("  sh <script.sh>   - Exécuter un script bash")
          output.push("  ./<script.sh>    - Exécuter un script bash")
          output.push("  script <nom>     - Créer un nouveau script bash")
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

        case "tree":
          try {
            // Fonction récursive pour afficher l'arborescence
            const displayTree = async (path: string, prefix: string, isLast: boolean, depth: number = 0) => {
              try {
                const files = await fileService.listAll(path)
                const sortedFiles = files.sort((a, b) => {
                  if (a.type !== b.type) {
                    return a.type === "folder" ? -1 : 1
                  }
                  return a.name.localeCompare(b.name)
                })
                
                for (let i = 0; i < sortedFiles.length; i++) {
                  const file = sortedFiles[i]
                  const isLastFile = i === sortedFiles.length - 1
                  const filePrefix = isLastFile ? "└── " : "├── "
                  const icon = file.type === "folder" ? "📁" : "📄"
                  
                  // Afficher le fichier/dossier actuel
                  output.push(`${prefix}${filePrefix}${icon} ${file.name}`)
                  
                  // Si c'est un dossier, explorer récursivement
                  if (file.type === "folder") {
                    const subPath = path === "/" ? `/${file.name}` : `${path}/${file.name}`
                    // Calculer le nouveau préfixe pour les enfants
                    const childPrefix = prefix + (isLastFile ? "    " : "│   ")
                    await displayTree(subPath, childPrefix, isLastFile, depth + 1)
                  }
                }
              } catch (error) {
                // Si on ne peut pas accéder au dossier, on continue
                console.warn(`Impossible d'accéder au dossier ${path}:`, error)
              }
            }
            
            // Commencer l'affichage récursif depuis le répertoire actuel
            output.push(".")
            await displayTree(currentPath, "", true, 0)
            
          } catch (error) {
            output.push(`Erreur lors de l'affichage de l'arborescence: ${error}`)
            success = false
          }
          break

        case "find":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier/dossier à rechercher requis.")
            output.push("Usage: find <nom>")
            success = false
          } else {
            const searchTerm = args[0].toLowerCase()
            const findFiles = getCurrentDirectory()
            const matches = findFiles.filter(file => 
              file.name.toLowerCase().includes(searchTerm)
            )
            
            if (matches.length === 0) {
              output.push(`Aucun fichier/dossier trouvé contenant '${searchTerm}'`)
            } else {
              output.push(`Résultats pour '${searchTerm}':`)
              matches.forEach(file => {
                const icon = file.type === "folder" ? "📁" : "📄"
                output.push(`  ${icon} ${file.path}`)
              })
            }
          }
          break

        case "echo":
          if (args.length === 0) {
            output.push("")
          } else {
            output.push(args.join(" "))
          }
          break

        case "wc":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier requis.")
            output.push("Usage: wc <fichier>")
            success = false
          } else {
            const fileName = args[0]
            const files = getCurrentDirectory()
            const file = files.find(f => f.name === fileName)
            
            if (file && file.type === "file") {
              try {
                const content = await fileService.getFileContent(file.path)
                const lines = content.split('\n')
                const words = content.split(/\s+/).filter(word => word.length > 0)
                const chars = content.length
                
                output.push(`${lines.length} lignes, ${words.length} mots, ${chars} caractères ${fileName}`)
              } catch (error) {
                output.push(`Erreur lors de la lecture du fichier: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: Fichier '${fileName}' non trouvé.`)
              success = false
            }
          }
          break

        case "cp":
          if (args.length < 2) {
            output.push("Erreur: Source et destination requises.")
            output.push("Usage: cp <source> <destination>")
            success = false
          } else {
            const source = args[0]
            const destination = args[1]
            const files = getCurrentDirectory()
            const sourceFile = files.find(f => f.name === source)
            const destFile = files.find(f => f.name === destination)
            
            if (sourceFile) {
              try {
                if (sourceFile.type === "file") {
                  const content = await fileService.getFileContent(sourceFile.path)
                  
                  // Si la destination est un dossier, copier avec le nom original
                  if (destFile && destFile.type === "folder") {
                    const destPath = currentPath === "/" ? `/${destination}` : `${currentPath}/${destination}`
                    await fileService.createFile(destPath, source, content)
                    output.push(`Fichier '${source}' copié dans le dossier '${destination}'`)
                  } else {
                    // Sinon, créer avec le nom de destination
                    await fileService.createFile(currentPath, destination, content)
                    output.push(`Fichier '${source}' copié vers '${destination}'`)
                  }
                } else {
                  // Pour les dossiers, créer un nouveau dossier
                  if (destFile && destFile.type === "folder") {
                    const destPath = currentPath === "/" ? `/${destination}` : `${currentPath}/${destination}`
                    await fileService.createFolder(destPath, source)
                    output.push(`Dossier '${source}' copié dans le dossier '${destination}'`)
                  } else {
                    await fileService.createFolder(currentPath, destination)
                    output.push(`Dossier '${source}' copié vers '${destination}'`)
                  }
                }
                await loadCurrentDirectory()
              } catch (error) {
                output.push(`Erreur lors de la copie: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: Source '${source}' non trouvée.`)
              success = false
            }
          }
          break

        case "mv":
          if (args.length < 2) {
            output.push("Erreur: Source et destination requises.")
            output.push("Usage: mv <source> <destination>")
            success = false
          } else {
            const source = args[0]
            const destination = args[1]
            const files = getCurrentDirectory()
            const sourceFile = files.find(f => f.name === source)
            const destFile = files.find(f => f.name === destination)
            
            if (sourceFile) {
              try {
                // Copier d'abord
                if (sourceFile.type === "file") {
                  const content = await fileService.getFileContent(sourceFile.path)
                  
                  // Si la destination est un dossier, copier avec le nom original
                  if (destFile && destFile.type === "folder") {
                    const destPath = currentPath === "/" ? `/${destination}` : `${currentPath}/${destination}`
                    await fileService.createFile(destPath, source, content)
                    output.push(`Fichier '${source}' déplacé dans le dossier '${destination}'`)
                  } else {
                    // Sinon, créer avec le nom de destination
                    await fileService.createFile(currentPath, destination, content)
                    output.push(`Fichier '${source}' déplacé vers '${destination}'`)
                  }
                } else {
                  // Pour les dossiers, créer un nouveau dossier
                  if (destFile && destFile.type === "folder") {
                    const destPath = currentPath === "/" ? `/${destination}` : `${currentPath}/${destination}`
                    await fileService.createFolder(destPath, source)
                    output.push(`Dossier '${source}' déplacé dans le dossier '${destination}'`)
                  } else {
                    await fileService.createFolder(currentPath, destination)
                    output.push(`Dossier '${source}' déplacé vers '${destination}'`)
                  }
                }
                
                // Puis supprimer l'original
                if (sourceFile.type === "folder") {
                  await fileService.deleteFolder(sourceFile.id)
                } else {
                  await fileService.deleteFileById(sourceFile.id)
                }
                
                await loadCurrentDirectory()
              } catch (error) {
                output.push(`Erreur lors du déplacement: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: Source '${source}' non trouvée.`)
              success = false
            }
          }
          break

        case "head":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier requis.")
            output.push("Usage: head <fichier> [nombre_lignes]")
            success = false
          } else {
            const fileName = args[0]
            const lines = args[1] ? parseInt(args[1]) : 10
            const files = getCurrentDirectory()
            const file = files.find(f => f.name === fileName)
            
            if (file && file.type === "file") {
              try {
                const content = await fileService.getFileContent(file.path)
                const contentLines = content.split('\n')
                const headLines = contentLines.slice(0, lines)
                headLines.forEach(line => output.push(line))
              } catch (error) {
                output.push(`Erreur lors de la lecture du fichier: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: Fichier '${fileName}' non trouvé.`)
              success = false
            }
          }
          break

        case "tail":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier requis.")
            output.push("Usage: tail <fichier> [nombre_lignes]")
            success = false
          } else {
            const fileName = args[0]
            const lines = args[1] ? parseInt(args[1]) : 10
            const files = getCurrentDirectory()
            const file = files.find(f => f.name === fileName)
            
            if (file && file.type === "file") {
              try {
                const content = await fileService.getFileContent(file.path)
                const contentLines = content.split('\n')
                const tailLines = contentLines.slice(-lines)
                tailLines.forEach(line => output.push(line))
              } catch (error) {
                output.push(`Erreur lors de la lecture du fichier: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: Fichier '${fileName}' non trouvé.`)
              success = false
            }
          }
          break

        case "grep":
          if (args.length < 2) {
            output.push("Erreur: Motif et fichier requis.")
            output.push("Usage: grep <motif> <fichier>")
            success = false
          } else {
            const pattern = args[0]
            const fileName = args[1]
            const files = getCurrentDirectory()
            const file = files.find(f => f.name === fileName)
            
            if (file && file.type === "file") {
              try {
                const content = await fileService.getFileContent(file.path)
                const lines = content.split('\n')
                const matches = lines.filter(line => 
                  line.toLowerCase().includes(pattern.toLowerCase())
                )
                
                if (matches.length === 0) {
                  output.push(`Aucune correspondance trouvée pour '${pattern}'`)
                } else {
                  output.push(`Correspondances pour '${pattern}' dans ${fileName}:`)
                  matches.forEach(line => output.push(`  ${line}`))
                }
              } catch (error) {
                output.push(`Erreur lors de la lecture du fichier: ${error}`)
                success = false
              }
            } else {
              output.push(`Erreur: Fichier '${fileName}' non trouvé.`)
              success = false
            }
          }
          break

        case "du":
          try {
            const files = getCurrentDirectory()
            let totalSize = 0
            const sizeMap = new Map<string, number>()
            
            for (const file of files) {
              if (file.type === "file") {
                totalSize += file.size
                sizeMap.set(file.name, file.size)
              }
            }
            
            output.push(`Taille totale: ${formatFileSize(totalSize)}`)
            output.push("Détail par fichier:")
            
            // Trier par taille décroissante
            const sortedFiles = Array.from(sizeMap.entries())
              .sort(([,a], [,b]) => b - a)
            
            sortedFiles.forEach(([name, size]) => {
              output.push(`  ${formatFileSize(size)} ${name}`)
            })
          } catch (error) {
            output.push(`Erreur lors du calcul de la taille: ${error}`)
            success = false
          }
          break

        case "stat":
          if (args.length === 0) {
            output.push("Erreur: Nom de fichier/dossier requis.")
            output.push("Usage: stat <nom>")
            success = false
          } else {
            const fileName = args[0]
            const files = getCurrentDirectory()
            const file = files.find(f => f.name === fileName)
            
            if (file) {
              output.push(`Fichier: ${file.name}`)
              output.push(`Type: ${file.type}`)
              output.push(`Taille: ${file.type === "file" ? formatFileSize(file.size) : "0 bytes"}`)
              output.push(`Chemin: ${file.path}`)
              output.push(`Créé: ${typeof file.createdAt === 'string' ? new Date(file.createdAt).toLocaleString() : file.createdAt.toLocaleString()}`)
              output.push(`Modifié: ${typeof file.modifiedAt === 'string' ? new Date(file.modifiedAt).toLocaleString() : file.modifiedAt.toLocaleString()}`)
              if (file.extension) {
                output.push(`Extension: ${file.extension}`)
              }
            } else {
              output.push(`Erreur: '${fileName}' non trouvé.`)
              success = false
            }
          }
          break

        case "history":
          if (commandHistory.length === 0) {
            output.push("Aucune commande dans l'historique.")
          } else {
            output.push("Historique des commandes:")
            commandHistory.forEach((entry, index) => {
              const timestamp = entry.timestamp.toLocaleTimeString()
              const status = entry.success ? "✓" : "✗"
              output.push(`  ${index + 1} [${timestamp}] ${status} ${entry.command}`)
            })
          }
          break

        case "alias":
          if (args.length === 0) {
            output.push("Alias disponibles:")
            output.push("  ll = ls")
            output.push("  la = ls -la")
            output.push("  .. = cd ..")
            output.push("  ~ = cd /")
          } else {
            output.push("Création d'alias non implémentée pour le moment.")
          }
          break

        case "ll":
        case "la":
          // Alias pour ls avec plus de détails
          const listFiles = getCurrentDirectory()
          if (listFiles.length === 0) {
            output.push("Le répertoire est vide.")
          } else {
            const sortedFiles = listFiles.sort((a, b) => {
              if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1
              }
              return a.name.localeCompare(b.name)
            })
            
            output.push(`total ${listFiles.length}`)
            sortedFiles.forEach(file => {
              const icon = file.type === "folder" ? "📁" : "📄"
              const size = file.type === "folder" ? "0" : file.size.toString()
              const date = typeof file.modifiedAt === 'string' ? new Date(file.modifiedAt).toLocaleDateString() : file.modifiedAt.toLocaleDateString()
              const permissions = file.type === "folder" ? "drwxr-xr-x" : "-rw-r--r--"
              output.push(`${permissions} 1 user user ${size.padStart(8)} ${date} ${icon} ${file.name}`)
            })
          }
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
    return getFileItemIconEmoji(file)
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