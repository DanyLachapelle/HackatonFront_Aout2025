import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { 
  PencilIcon, 
  SquareIcon, 
  CircleIcon, 
  TypeIcon, 
  EraserIcon,
  PaletteIcon,
  DownloadIcon,
  TrashIcon,
  UndoIcon,
  RedoIcon,
  SaveIcon,
  ImageIcon
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

export function Paint() {
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
    { id: "pencil", icon: PencilIcon, label: "Crayon", description: "Dessine avec un crayon" },
    { id: "eraser", icon: EraserIcon, label: "Gomme", description: "Efface le dessin" },
    { id: "rectangle", icon: SquareIcon, label: "Rectangle", description: "Dessine un rectangle" },
    { id: "circle", icon: CircleIcon, label: "Cercle", description: "Dessine un cercle" },
    { id: "text", icon: TypeIcon, label: "Texte", description: "Ajoute du texte" }
  ]

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

    // Redessiner toutes les actions
    redrawCanvas()
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
            <UndoIcon className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={redo} 
            disabled={undoStack.length === 0}
            title="Rétablir (Ctrl+Y)"
          >
            <RedoIcon className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearCanvas}
            title="Effacer tout le canvas"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadImage}
            title="Télécharger l'image (PNG)"
          >
            <DownloadIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Panneau latéral */}
        <div className="w-64 p-4 bg-white dark:bg-gray-800 border-r">
          {/* Couleurs */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" />
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
            <Slider
              value={[brushSize]}
              onValueChange={([value]) => setBrushSize(value)}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {brushSize}px
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
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair border rounded"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setIsDrawing(false)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de saisie de texte */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Ajouter du texte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Entrez votre texte..."
                className="w-full p-2 border rounded"
                autoFocus
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 