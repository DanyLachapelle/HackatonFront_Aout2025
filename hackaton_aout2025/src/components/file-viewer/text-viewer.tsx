import React, { useState, useEffect } from 'react'
import { Search, Copy, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TextViewerProps {
  content: string
  fileName: string
}

export const TextViewer: React.FC<TextViewerProps> = ({ content, fileName }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [lineNumbers, setLineNumbers] = useState(true)

  // Détection du type de fichier pour la coloration syntaxique
  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return 'javascript'
      case 'html':
      case 'htm':
        return 'html'
      case 'css':
        return 'css'
      case 'json':
        return 'json'
      case 'xml':
        return 'xml'
      case 'md':
        return 'markdown'
      case 'py':
        return 'python'
      case 'java':
        return 'java'
      case 'cpp':
      case 'c':
        return 'cpp'
      case 'php':
        return 'php'
      case 'sql':
        return 'sql'
      case 'sh':
      case 'bash':
        return 'bash'
      default:
        return 'text'
    }
  }

  const fileType = getFileType(fileName)

  // Recherche dans le contenu
  useEffect(() => {
    if (!searchQuery) {
      setTotalMatches(0)
      setCurrentMatch(0)
      return
    }

    const regex = new RegExp(searchQuery, 'gi')
    const matches = content.match(regex) || []
    setTotalMatches(matches.length)
    setCurrentMatch(1)
  }, [searchQuery, content])

  const findNext = () => {
    if (!searchQuery) return
    const regex = new RegExp(searchQuery, 'gi')
    const matches = [...content.matchAll(regex)]
    if (matches.length > 0) {
      setCurrentMatch(prev => prev >= matches.length ? 1 : prev + 1)
    }
  }

  const findPrevious = () => {
    if (!searchQuery) return
    const regex = new RegExp(searchQuery, 'gi')
    const matches = [...content.matchAll(regex)]
    if (matches.length > 0) {
      setCurrentMatch(prev => prev <= 1 ? matches.length : prev - 1)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
  }

  // Coloration syntaxique simple
  const highlightSyntax = (text: string, type: string): string => {
    if (type === 'text') return text

    // Coloration basique pour quelques langages
    let highlighted = text

    if (type === 'javascript' || type === 'typescript') {
      // Mots-clés JavaScript
      const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'default', 'async', 'await']
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g')
        highlighted = highlighted.replace(regex, `<span class="text-blue-600 dark:text-blue-400 font-semibold">${keyword}</span>`)
      })

      // Chaînes de caractères
      highlighted = highlighted.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600 dark:text-green-400">$1$2$1</span>')

      // Commentaires
      highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="text-gray-500 dark:text-gray-400 italic">$&</span>')
      highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500 dark:text-gray-400 italic">$&</span>')

      // Nombres
      highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, '<span class="text-orange-600 dark:text-orange-400">$&</span>')
    }

    if (type === 'html') {
      // Balises HTML
      highlighted = highlighted.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, '<span class="text-red-600 dark:text-red-400">&lt;$1$2$3&gt;</span>')

      // Attributs
      highlighted = highlighted.replace(/(\w+)=["'][^"']*["']/g, '<span class="text-blue-600 dark:text-blue-400">$1</span><span class="text-gray-600 dark:text-gray-400">=</span><span class="text-green-600 dark:text-green-400">$&</span>')
    }

    if (type === 'css') {
      // Propriétés CSS
      highlighted = highlighted.replace(/([a-zA-Z-]+):/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>:')

      // Valeurs
      highlighted = highlighted.replace(/:\s*([^;]+);/g, ': <span class="text-green-600 dark:text-green-400">$1</span>;')

      // Sélecteurs
      highlighted = highlighted.replace(/([.#]?[a-zA-Z][a-zA-Z0-9_-]*)/g, '<span class="text-red-600 dark:text-red-400">$1</span>')
    }

    return highlighted
  }

  const highlightedContent = highlightSyntax(content, fileType)

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {fileType.toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={(e) => setLineNumbers(e.target.checked)}
                className="mr-1"
              />
              Numéros de ligne
            </label>
            
            <label className="text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
                className="mr-1"
              />
              Retour à la ligne
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="p-2"
          >
            <Search className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="p-2"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
          </select>
        </div>
      </div>

      {/* Barre de recherche */}
      {showSearch && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalMatches > 0 ? `${currentMatch}/${totalMatches}` : '0/0'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={findPrevious}
              disabled={totalMatches === 0}
            >
              ↑
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={findNext}
              disabled={totalMatches === 0}
            >
              ↓
            </Button>
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        <div 
          className={`font-mono text-sm p-4 ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {lineNumbers ? (
            <div className="flex">
              {/* Numéros de ligne */}
              <div className="text-gray-400 dark:text-gray-600 pr-4 select-none border-r border-gray-200 dark:border-gray-700">
                {content.split('\n').map((_, index) => (
                  <div key={index} className="text-right">
                    {index + 1}
                  </div>
                ))}
              </div>
              
              {/* Contenu avec coloration */}
              <div 
                className="pl-4 flex-1"
                dangerouslySetInnerHTML={{ __html: highlightedContent.split('\n').map((line, index) => 
                  `<div key="${index}">${line || ' '}</div>`
                ).join('') }}
              />
            </div>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: highlightedContent.split('\n').map((line, index) => 
                `<div key="${index}">${line || ' '}</div>`
              ).join('') }}
            />
          )}
        </div>
      </div>

      {/* Barre de statut */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Lignes: {content.split('\n').length}</span>
            <span>Caractères: {content.length}</span>
            <span>Mots: {content.split(/\s+/).filter(word => word.length > 0).length}</span>
          </div>
          <div className="text-xs">
            Raccourcis: Ctrl+F (recherche), Ctrl+C (copier)
          </div>
        </div>
      </div>
    </div>
  )
} 