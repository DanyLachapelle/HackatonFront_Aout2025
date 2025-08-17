import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { fileService } from "@/services/file-service"
import { 
  Search, Replace, Save, Download, Copy, Clipboard,
  Undo, Redo, ZoomIn, ZoomOut, Sun, Moon, X
} from "lucide-react"
import { useCustomAlert, CustomAlert } from "@/components/ui/custom-alert"

interface TextDocument {
  id: string
  name: string
  content: string
  lastModified: Date
  isModified: boolean
  filePath?: string
}

interface TextEditorProps {
  windowId?: string
  filePath?: string
}

export function TextEditor({ windowId, filePath }: TextEditorProps) {
  const [documents, setDocuments] = useState<TextDocument[]>([
    {
      id: "1",
      name: "Document sans titre",
      content: "Bienvenue dans l'éditeur de texte !\n\nVous pouvez commencer à écrire ici...\n\nFonctionnalités disponibles :\n• Recherche et remplacement\n• Thèmes sombre/clair\n• Zoom in/out\n• Sauvegarde automatique\n\nL'éditeur a été simplifié pour se concentrer sur l'écriture.\nLa barre latérale a été supprimée pour maximiser l'espace d'édition.\n\nVous pouvez maintenant faire défiler le contenu verticalement si le texte est plus long que la zone visible.",
      lastModified: new Date(),
      isModified: false
    }
  ])
  
  const [currentDocument, setCurrentDocument] = useState<TextDocument>(documents[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [zoom, setZoom] = useState(100)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showError, showSuccess, alert, hideAlert } = useCustomAlert()

  // Charger le fichier si filePath est fourni
  useEffect(() => {
    if (filePath) {
      loadFileFromPath(filePath)
    }
  }, [filePath])

  const loadFileFromPath = async (path: string) => {
    try {
      const content = await fileService.getFileContent(path)
      const fileName = path.split('/').pop() || 'Fichier inconnu'
      
      const newDocument: TextDocument = {
        id: `file-${Date.now()}`,
        name: fileName,
        content: content,
        lastModified: new Date(),
        isModified: false,
        filePath: path
      }
      
      setDocuments([newDocument])
      setCurrentDocument(newDocument)
      setUndoStack([])
      setRedoStack([])
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error)
      // Créer un document vide avec le nom du fichier
      const fileName = path.split('/').pop() || 'Fichier inconnu'
      const newDocument: TextDocument = {
        id: `file-${Date.now()}`,
        name: fileName,
        content: `# ${fileName}\n\nFichier créé automatiquement.\n\nContenu original non disponible.`,
        lastModified: new Date(),
        isModified: false,
        filePath: path
      }
      
      setDocuments([newDocument])
      setCurrentDocument(newDocument)
    }
  }

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            saveDocument()
            break
          case "f":
            e.preventDefault()
            setShowSearch(true)
            break
          case "h":
            e.preventDefault()
            setShowReplace(true)
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleContentChange = (newContent: string) => {
    const previousContent = currentDocument.content
    updateDocumentContent(newContent)
    
    // Ajouter à l'historique undo
    setUndoStack(prev => [...prev, previousContent])
    setRedoStack([])
  }

  const updateDocumentContent = (newContent: string) => {
    const updatedDoc = { 
      ...currentDocument, 
      content: newContent, 
      isModified: true,
      lastModified: new Date() 
    }
    setCurrentDocument(updatedDoc)
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
  }

  const undo = () => {
    if (undoStack.length > 0) {
      const previousContent = undoStack[undoStack.length - 1]
      const currentContent = currentDocument.content
      
      setUndoStack(prev => prev.slice(0, -1))
      setRedoStack(prev => [...prev, currentContent])
      
      const updatedDoc = { 
        ...currentDocument, 
        content: previousContent, 
        isModified: true,
        lastModified: new Date() 
      }
      setCurrentDocument(updatedDoc)
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
    }
  }

  const redo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1]
      const currentContent = currentDocument.content
      
      setRedoStack(prev => prev.slice(0, -1))
      setUndoStack(prev => [...prev, currentContent])
      
      const updatedDoc = { 
        ...currentDocument, 
        content: nextContent, 
        isModified: true,
        lastModified: new Date() 
      }
      setCurrentDocument(updatedDoc)
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
    }
  }

  const findText = () => {
    if (!searchQuery.trim()) return
    
    const textarea = textareaRef.current
    if (!textarea) return
    
    const content = textarea.value
    const searchIndex = content.toLowerCase().indexOf(searchQuery.toLowerCase())
    
    if (searchIndex !== -1) {
      textarea.setSelectionRange(searchIndex, searchIndex + searchQuery.length)
      textarea.focus()
    }
  }

  const replaceText = () => {
    if (!searchQuery.trim() || !replaceQuery.trim()) return
    
    const textarea = textareaRef.current
    if (!textarea) return
    
    const content = textarea.value
    const searchIndex = content.toLowerCase().indexOf(searchQuery.toLowerCase())
    
    if (searchIndex !== -1) {
      const newContent = content.substring(0, searchIndex) + replaceQuery + content.substring(searchIndex + searchQuery.length)
      updateDocumentContent(newContent)
    }
  }

  const replaceAllText = () => {
    if (!searchQuery.trim() || !replaceQuery.trim()) return
    
    const content = currentDocument.content
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const newContent = content.replace(regex, replaceQuery)
    updateDocumentContent(newContent)
  }

  const saveDocument = async () => {
    try {
      if (currentDocument.filePath) {
        await fileService.updateFileContent(currentDocument.filePath, currentDocument.content)
        console.log(`Fichier sauvegardé: ${currentDocument.filePath}`)
      } else {
        // Sinon, créer un nouveau fichier
        const fileName = currentDocument.name.endsWith('.txt') ? currentDocument.name : `${currentDocument.name}.txt`
        await fileService.createFile('/', fileName, currentDocument.content)
        console.log(`Nouveau fichier créé: ${fileName}`)
        
        // Mettre à jour le document avec le nouveau chemin
        const updatedDoc = { 
          ...currentDocument, 
          filePath: `/${fileName}`,
          isModified: false, 
          lastModified: new Date() 
        }
        setCurrentDocument(updatedDoc)
        setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
        return
      }
      
      const updatedDoc = { ...currentDocument, isModified: false, lastModified: new Date() }
      setCurrentDocument(updatedDoc)
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      showError('Erreur de sauvegarde', 'Impossible de sauvegarder le fichier. Veuillez réessayer.')
    }
  }

  const downloadDocument = () => {
    const blob = new Blob([currentDocument.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentDocument.name}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentDocument.content)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const content = textarea.value
        const newContent = content.substring(0, start) + text + content.substring(textarea.selectionEnd)
        updateDocumentContent(newContent)
      }
    } catch (error) {
      console.error('Erreur lors du collage:', error)
    }
  }

  return (
    <TooltipProvider>
      <div className={`flex h-full overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
        <CustomAlert {...alert} onClose={hideAlert} />
        {/* Zone principale - Pleine largeur */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barre d'outils */}
          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveDocument}
                      disabled={!currentDocument.isModified}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sauvegarder (Ctrl+S)</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadDocument}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Télécharger le fichier</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSearch(!showSearch)}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rechercher (Ctrl+F)</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplace(!showReplace)}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Replace className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remplacer (Ctrl+H)</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={undo}
                      disabled={undoStack.length === 0}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600"
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Annuler (Ctrl+Z)</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={redo}
                      disabled={redoStack.length === 0}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600"
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rétablir (Ctrl+Shift+Z)</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copier tout le contenu</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={pasteFromClipboard}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coller depuis le presse-papiers</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom arrière</p>
                  </TooltipContent>
                </Tooltip>
                
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom avant</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Changer le thème</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Barre de recherche/remplacement */}
            {(showSearch || showReplace) && (
              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        findText()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={findText}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Rechercher
                  </Button>
                  
                  {showReplace && (
                    <>
                      <Input
                        placeholder="Remplacer par..."
                        value={replaceQuery}
                        onChange={(e) => setReplaceQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={replaceText}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Remplacer
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={replaceAllText}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Tout remplacer
                      </Button>
                    </>
                  )}
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowSearch(false)
                          setShowReplace(false)
                          setSearchQuery("")
                          setReplaceQuery("")
                        }}
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fermer la recherche</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>

          {/* Zone de texte avec défilement */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Textarea
                ref={textareaRef}
                value={currentDocument.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className={`w-full h-full resize-none border-0 focus:ring-0 text-sm font-mono p-4 ${
                  theme === 'dark' 
                    ? 'bg-gray-900 text-gray-100' 
                    : 'bg-white text-gray-900'
                }`}
                style={{
                  fontSize: `${zoom}%`,
                  lineHeight: '1.6',
                  minHeight: '100%',
                  height: 'auto'
                }}
                placeholder="Commencez à écrire..."
              />
            </div>
          </div>

          {/* Barre de statut */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {currentDocument.content.length} caractères
              </span>
              <span>
                {currentDocument.isModified ? 'Modifié' : 'Sauvegardé'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
} 