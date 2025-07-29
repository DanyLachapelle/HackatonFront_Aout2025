import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Pencil, Eraser, Square, Circle, Type, Undo, Redo, 
  Download, Trash2, Palette, Minus, Plus
} from "lucide-react"

type Tool = "pencil" | "eraser" | "rectangle" | "circle" | "text"
type Color = string

interface Point {
  x: number
  y: number
}

interface DrawingAction {
  type: "draw" | "erase" | "shape" | "text"
  tool: Tool
  color: Color
  size: number
  points?: Point[]
  startPoint?: Point
  endPoint?: Point
  text?: string
  textPosition?: Point
}

interface PaintProps {
  windowId?: string
}

export function Paint({ windowId }: PaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<Tool>("pencil")
  const [currentColor, setCurrentColor] = useState<Color>("#000000")
  const [brushSize, setBrushSize] = useState(2)
  const [actions, setActions] = useState<DrawingAction[]>([])
  const [undoStack, setUndoStack] = useState<DrawingAction[]>([])
  const [textInput, setTextInput] = useState("")
  const [showTextInput, setShowTextInput] = useState(false)
  const [textPosition, setTextPosition] = useState<Point | null>(null)

  const colors = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
    "#008000", "#ffc0cb", "#a52a2a", "#808080", "#000080"
  ]

  const tools = [
    { id: "pencil", icon: Pencil, label: "Crayon", description: "Dessine avec un crayon" },
    { id: "eraser", icon: Eraser, label: "Gomme", description: "Efface le dessin" },
    { id: "rectangle", icon: Square, label: "Rectangle", description: "Dessine un rectangle" },
    { id: "circle", icon: Circle, label: "Cercle", description: "Dessine un cercle" },
    { id: "text", icon: Type, label: "Texte", description: "Ajoute du texte" }
  ]

  // Sauvegarder l'état quand il change
  useEffect(() => {
    if (windowId) {
      const canvas = canvasRef.current
      if (canvas) {
        const canvasData = canvas.toDataURL()
        // updatePaintState(windowId, {
        //   canvasData,
        //   brushSize,
        //   brushColor: currentColor,
        //   currentTool
        // })
      }
    }
  }, [currentTool, currentColor, brushSize, windowId])

  // Sauvegarder les actions séparément
  useEffect(() => {
    if (windowId) {
      // updatePaintState(windowId, {
      //   actions: actions.map(action => ({
      //     type: action.type,
      //     tool: action.tool,
      //     color: action.color,
      //     size: action.size,
      //     points: action.points,
      //     startPoint: action.startPoint,
      //     endPoint: action.endPoint,
      //     text: action.text,
      //     textPosition: action.textPosition
      //   })),
      //   undoStack: undoStack.map(action => ({
      //     type: action.type,
      //     tool: action.tool,
      //     color: action.color,
      //     size: action.size,
      //     points: action.points,
      //     startPoint: action.startPoint,
      //     endPoint: action.endPoint,
      //     text: action.text,
      //     textPosition: action.textPosition
      //   }))
    }
  }, [actions, undoStack, windowId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Définir la taille du canvas
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Remplir le fond en blanc
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Restaurer le canvas sauvegardé s'il existe
    // if (savedState?.canvasData) {
    //   const img = new Image()
    //   img.onload = () => {
    //     ctx.drawImage(img, 0, 0)
    //   }
    //   img.src = savedState.canvasData
    // } else {
      // Redessiner toutes les actions
      redrawCanvas()
    // }
  }, [])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Effacer le canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redessiner toutes les actions
    actions.forEach(action => {
      ctx.strokeStyle = action.color
      ctx.fillStyle = action.color
      ctx.lineWidth = action.size
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      switch (action.type) {
        case "draw":
        case "erase":
          if (action.points && action.points.length > 1) {
            ctx.beginPath()
            ctx.moveTo(action.points[0].x, action.points[0].y)
            for (let i = 1; i < action.points.length; i++) {
              ctx.lineTo(action.points[i].x, action.points[i].y)
            }
            ctx.stroke()
          }
          break

        case "shape":
          if (action.startPoint && action.endPoint) {
            const { startPoint, endPoint } = action
            const width = endPoint.x - startPoint.x
            const height = endPoint.y - startPoint.y

            if (action.tool === "rectangle") {
              ctx.strokeRect(startPoint.x, startPoint.y, width, height)
            } else if (action.tool === "circle") {
              const radius = Math.sqrt(width * width + height * height)
              ctx.beginPath()
              ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
              ctx.stroke()
            }
          }
          break

        case "text":
          if (action.text && action.textPosition) {
            ctx.font = `${action.size * 8}px Arial`
            ctx.fillText(action.text, action.textPosition.x, action.textPosition.y)
          }
          break
      }
    })
  }

  useEffect(() => {
    redrawCanvas()
  }, [actions])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const pos = getMousePos(e)

    if (currentTool === "text") {
      setTextPosition(pos)
      setShowTextInput(true)
      return
    }

    const newAction: DrawingAction = {
      type: currentTool === "eraser" ? "erase" : "draw",
      tool: currentTool,
      color: currentTool === "eraser" ? "#ffffff" : currentColor,
      size: brushSize,
      points: [pos],
      startPoint: pos
    }

    setActions(prev => [...prev, newAction])
    setUndoStack([]) // Vider la pile de redo quand on dessine
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool === "text") return

    const pos = getMousePos(e)
    setActions(prev => {
      const newActions = [...prev]
      const lastAction = newActions[newActions.length - 1]
      
      if (lastAction && (lastAction.type === "draw" || lastAction.type === "erase")) {
        lastAction.points = [...(lastAction.points || []), pos]
      }
      
      return newActions
    })
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const pos = getMousePos(e)

    if (currentTool === "rectangle" || currentTool === "circle") {
      setActions(prev => {
        const newActions = [...prev]
        const lastAction = newActions[newActions.length - 1]
        
        if (lastAction) {
          lastAction.type = "shape"
          lastAction.endPoint = pos
        }
        
        return newActions
      })
    }

    setIsDrawing(false)
  }

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const newAction: DrawingAction = {
        type: "text",
        tool: "text",
        color: currentColor,
        size: brushSize,
        text: textInput,
        textPosition: textPosition
      }

      setActions(prev => [...prev, newAction])
      setUndoStack([])
    }

    setTextInput("")
    setShowTextInput(false)
    setTextPosition(null)
  }

  const clearCanvas = () => {
    setActions([])
    setUndoStack([])
  }

  const undo = () => {
    if (actions.length > 0) {
      const lastAction = actions[actions.length - 1]
      setUndoStack(prev => [...prev, lastAction])
      setActions(prev => prev.slice(0, -1))
    }
  }

  const redo = () => {
    if (undoStack.length > 0) {
      const actionToRedo = undoStack[undoStack.length - 1]
      setActions(prev => [...prev, actionToRedo])
      setUndoStack(prev => prev.slice(0, -1))
    }
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "paint-drawing.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center space-x-2">
          {/* Outils */}
          {tools.map(tool => (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool(tool.id as Tool)}
              className="flex items-center gap-2"
              title={tool.description}
            >
              <tool.icon className="w-4 h-4" />
              {tool.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Actions */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={undo} 
            disabled={actions.length === 0}
            title="Annuler (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={redo} 
            disabled={undoStack.length === 0}
            title="Rétablir (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearCanvas}
            title="Effacer tout le canvas"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadImage}
            title="Télécharger l'image (PNG)"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Panneau latéral */}
        <div className="w-64 p-4 bg-white dark:bg-gray-800 border-r">
          {/* Couleurs */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Couleurs
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    currentColor === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>
            <div className="mt-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-full h-10 rounded border"
              />
            </div>
          </div>

          {/* Taille du pinceau */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Taille du pinceau</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setBrushSize(prev => Math.max(1, prev - 1))} disabled={brushSize <= 1}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">{brushSize}px</span>
              <Button variant="outline" size="sm" onClick={() => setBrushSize(prev => Math.min(20, prev + 1))} disabled={brushSize >= 20}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Aperçu du pinceau */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Aperçu</h3>
            <div className="flex items-center justify-center h-16 bg-gray-100 dark:bg-gray-700 rounded">
              <div
                className="rounded-full"
                style={{
                  backgroundColor: currentColor,
                  width: brushSize * 2,
                  height: brushSize * 2
                }}
              />
            </div>
          </div>
        </div>

        {/* Zone de dessin */}
        <div className="flex-1 p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair border rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDrawing(false)}
          />
        </div>
      </div>

      {/* Modal de saisie de texte */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-96 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Ajouter du texte</h3>
            <div className="mb-4">
              <Label htmlFor="text-input" className="block text-sm font-medium mb-1">
                Texte
              </Label>
              <Input
                id="text-input"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTextSubmit()
                  } else if (e.key === "Escape") {
                    setShowTextInput(false)
                    setTextInput("")
                    setTextPosition(null)
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowTextInput(false)
                setTextInput("")
                setTextPosition(null)
              }}>
                Annuler
              </Button>
              <Button onClick={handleTextSubmit}>
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 