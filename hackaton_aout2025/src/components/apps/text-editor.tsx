import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fileService } from "@/services/file-service"
import { 
  Search, Replace, Save, Download, Plus, Trash2, Copy, Clipboard,
  Undo, Redo, ZoomIn, ZoomOut, Sun, Moon, FileText, X
} from "lucide-react"

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
      content: "Bienvenue dans l'éditeur de texte !\n\nVous pouvez commencer à écrire ici...\n\nFonctionnalités disponibles :\n• Recherche et remplacement\n• Thèmes sombre/clair\n• Zoom in/out\n• Sauvegarde automatique",
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
  const [showSidebar, setShowSidebar] = useState(true)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
          case "y":
            e.preventDefault()
            redo()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const saveToHistory = (content: string) => {
    setUndoStack(prev => [...prev, currentDocument.content])
    setRedoStack([])
  }

  const undo = () => {
    if (undoStack.length > 0) {
      const previousContent = undoStack[undoStack.length - 1]
      setRedoStack(prev => [...prev, currentDocument.content])
      setUndoStack(prev => prev.slice(0, -1))
      updateDocumentContent(previousContent)
    }
  }

  const redo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1]
      setUndoStack(prev => [...prev, currentDocument.content])
      setRedoStack(prev => prev.slice(0, -1))
      updateDocumentContent(nextContent)
    }
  }

  const updateDocumentContent = (content: string) => {
    const updatedDoc = { ...currentDocument, content, isModified: true }
    setCurrentDocument(updatedDoc)
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
  }

  const handleContentChange = (content: string) => {
    saveToHistory(currentDocument.content)
    updateDocumentContent(content)
  }

  const findText = () => {
    if (!searchQuery) return
    
    const textarea = textareaRef.current
    if (!textarea) return
    
    const content = textarea.value
    const index = content.toLowerCase().indexOf(searchQuery.toLowerCase())
    
    if (index !== -1) {
      textarea.focus()
      textarea.setSelectionRange(index, index + searchQuery.length)
    }
  }

  const replaceText = () => {
    if (!searchQuery || !replaceQuery) return
    
    const textarea = textareaRef.current
    if (!textarea) return
    
    const content = textarea.value
    const newContent = content.replace(searchQuery, replaceQuery)
    updateDocumentContent(newContent)
  }

  const replaceAllText = () => {
    if (!searchQuery || !replaceQuery) return
    
    const content = currentDocument.content
    const newContent = content.replace(new RegExp(searchQuery, 'gi'), replaceQuery)
    updateDocumentContent(newContent)
  }

  const saveDocument = async () => {
    try {
      // Si le document a un filePath, sauvegarder dans le fichier original
      if (currentDocument.filePath) {
        await fileService.updateFileContent(currentDocument.filePath, currentDocument.content)
        console.log(`Fichier sauvegardé: ${currentDocument.filePath}`)
      }
      
      const updatedDoc = { ...currentDocument, isModified: false, lastModified: new Date() }
      setCurrentDocument(updatedDoc)
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du fichier')
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

  const createNewDocument = () => {
    const newDoc: TextDocument = {
      id: Date.now().toString(),
      name: "Document sans titre",
      content: "",
      lastModified: new Date(),
      isModified: false
    }
    setDocuments(prev => [...prev, newDoc])
    setCurrentDocument(newDoc)
  }

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId))
    if (currentDocument.id === docId) {
      const remainingDocs = documents.filter(doc => doc.id !== docId)
      if (remainingDocs.length > 0) {
        setCurrentDocument(remainingDocs[0])
      }
    }
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
    <div className={`flex h-full ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Barre latérale */}
      {showSidebar && (
        <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Documents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={createNewDocument}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    currentDocument.id === doc.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setCurrentDocument(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium truncate">
                        {doc.name}
                        {doc.isModified && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteDocument(doc.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">
        {/* Barre d'outils */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <FileText className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={saveDocument}
                disabled={!currentDocument.isModified}
              >
                <Save className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadDocument}
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplace(!showReplace)}
              >
                <Replace className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={undoStack.length === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                <Redo className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={pasteFromClipboard}
              >
                <Clipboard className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                {zoom}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Barre de recherche/remplacement */}
          {(showSearch || showReplace) && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={findText}>
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
                    <Button size="sm" onClick={replaceText}>
                      Remplacer
                    </Button>
                    <Button size="sm" onClick={replaceAllText}>
                      Tout remplacer
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSearch(false)
                    setShowReplace(false)
                    setSearchQuery("")
                    setReplaceQuery("")
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Zone de texte */}
        <div className="flex-1 p-4">
          <Textarea
            ref={textareaRef}
            value={currentDocument.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className={`w-full h-full resize-none border-0 focus:ring-0 text-sm font-mono ${
              theme === 'dark' 
                ? 'bg-gray-900 text-gray-100' 
                : 'bg-white text-gray-900'
            }`}
            style={{
              fontSize: `${zoom}%`,
              lineHeight: '1.5'
            }}
            placeholder="Commencez à écrire..."
          />
        </div>

        {/* Barre de statut */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
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
  )
} 