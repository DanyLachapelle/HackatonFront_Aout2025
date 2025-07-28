import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDesktopStore } from "@/stores/desktop-store"
import { XIcon } from "lucide-react"

export function WallpaperSelector() {
  const { wallpaper, setWallpaper, setShowWallpaperSelector } = useDesktopStore()
  const [selectedType, setSelectedType] = useState(wallpaper.type || "gradient")

  const gradientPresets = [
    { name: "Océan", colors: ["#3b82f6", "#1e40af"], direction: "135deg" },
    { name: "Coucher de soleil", colors: ["#f59e0b", "#dc2626"], direction: "135deg" },
    { name: "Forêt", colors: ["#10b981", "#059669"], direction: "135deg" },
    { name: "Violet", colors: ["#8b5cf6", "#7c3aed"], direction: "135deg" },
    { name: "Rose", colors: ["#ec4899", "#be185d"], direction: "135deg" },
    { name: "Nuit", colors: ["#1f2937", "#111827"], direction: "135deg" },
  ]

  const solidColors = [
    "#3b82f6", // Bleu
    "#ef4444", // Rouge
    "#10b981", // Vert
    "#f59e0b", // Orange
    "#8b5cf6", // Violet
    "#ec4899", // Rose
    "#6b7280", // Gris
    "#1f2937", // Sombre
  ]

  const handleApply = () => {
    setShowWallpaperSelector(false)
  }

  const handleCancel = () => {
    setShowWallpaperSelector(false)
  }

  const handleGradientSelect = (preset: typeof gradientPresets[0]) => {
    setWallpaper({
      type: "gradient",
      colors: preset.colors,
      direction: preset.direction,
    })
  }

  const handleColorSelect = (color: string) => {
    setWallpaper({
      type: "solid",
      color,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personnaliser le bureau</CardTitle>
            <CardDescription>Choisissez votre fond d'écran et vos couleurs</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <XIcon className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Sélecteur de type */}
            <div className="flex space-x-2">
              <Button
                variant={selectedType === "gradient" ? "default" : "outline"}
                onClick={() => setSelectedType("gradient")}
                className="flex-1"
              >
                Dégradés
              </Button>
              <Button
                variant={selectedType === "solid" ? "default" : "outline"}
                onClick={() => setSelectedType("solid")}
                className="flex-1"
              >
                Couleurs
              </Button>
            </div>

            {/* Contenu dégradés */}
            {selectedType === "gradient" && (
              <div className="space-y-4">
                <h4 className="font-medium">Dégradés prédéfinis</h4>
                <div className="grid grid-cols-2 gap-3">
                  {gradientPresets.map((preset, index) => (
                    <div
                      key={index}
                      className="relative h-20 rounded-lg cursor-pointer border-2 transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(${preset.direction}, ${preset.colors.join(", ")})`,
                        borderColor:
                          wallpaper.type === "gradient" &&
                          JSON.stringify(wallpaper.colors) === JSON.stringify(preset.colors)
                            ? "#3b82f6"
                            : "transparent",
                      }}
                      onClick={() => handleGradientSelect(preset)}
                    >
                      <div className="absolute bottom-1 left-2 text-white text-xs font-medium drop-shadow">
                        {preset.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contenu couleurs */}
            {selectedType === "solid" && (
              <div className="space-y-4">
                <h4 className="font-medium">Couleurs prédéfinies</h4>
                <div className="grid grid-cols-4 gap-3">
                  {solidColors.map((color, index) => (
                    <div
                      key={index}
                      className="h-16 rounded-lg cursor-pointer border-4 transition-all hover:scale-105"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          wallpaper.type === "solid" && wallpaper.color === color ? "#3b82f6" : "transparent",
                      }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>

                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium">Couleur personnalisée</h5>
                  <input
                    type="color"
                    value={wallpaper.type === "solid" ? wallpaper.color : "#3b82f6"}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-full h-10 rounded border"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleApply}>Appliquer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 