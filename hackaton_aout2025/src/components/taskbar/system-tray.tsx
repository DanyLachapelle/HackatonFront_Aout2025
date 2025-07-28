import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Volume2, VolumeX, Wifi, Battery, Settings, Monitor } from "lucide-react"

export function SystemTray() {
  const { theme, setTheme } = useTheme()
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumePanel, setShowVolumePanel] = useState(false)
  const [showSystemPanel, setShowSystemPanel] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />
    if (volume < 30) return <Volume2 className="w-4 h-4" />
    return <Volume2 className="w-4 h-4" />
  }

  const getBatteryIcon = () => {
    // Simulation de la batterie
    const batteryLevel = 85
    if (batteryLevel > 80) return "🔋"
    if (batteryLevel > 50) return "🔋"
    if (batteryLevel > 20) return "🔋"
    return "🔋"
  }

  return (
    <div className="flex space-x-1">
      {/* Contrôle de volume */}
      <div className="relative">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 h-8 w-8 p-0"
          onClick={() => setShowVolumePanel(!showVolumePanel)}
          title={`Volume: ${isMuted ? 'Muet' : volume + '%'}`}
        >
          {getVolumeIcon()}
        </Button>

        {/* Panneau de volume */}
        {showVolumePanel && (
          <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-48 z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Volume
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-6 w-6 p-0"
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {isMuted ? 'Muet' : `${volume}%`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Applications</span>
                  <span className="text-gray-900 dark:text-white">75%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={75}
                  className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Réseau WiFi */}
      <Button
        variant="ghost"
        className="text-white hover:bg-white/10 h-8 w-8 p-0"
        title="Réseau WiFi"
      >
        <Wifi className="w-4 h-4" />
      </Button>

      {/* Batterie */}
      <Button
        variant="ghost"
        className="text-white hover:bg-white/10 h-8 w-8 p-0"
        title="Batterie: 85%"
      >
        <span className="text-sm">{getBatteryIcon()}</span>
      </Button>

      {/* Thème */}
      <Button
        variant="ghost"
        className="text-white hover:bg-white/10 h-8 w-8 p-0"
        onClick={toggleTheme}
        title="Changer le thème"
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </Button>

      {/* Paramètres système */}
      <div className="relative">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 h-8 w-8 p-0"
          onClick={() => setShowSystemPanel(!showSystemPanel)}
          title="Paramètres système"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Panneau système */}
        {showSystemPanel && (
          <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64 z-50">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Paramètres système
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Résolution</span>
                  <span className="text-gray-900 dark:text-white">1920x1080</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Taux de rafraîchissement</span>
                  <span className="text-gray-900 dark:text-white">60 Hz</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Thème</span>
                  <span className="text-gray-900 dark:text-white capitalize">{theme}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Langue</span>
                  <span className="text-gray-900 dark:text-white">Français</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  <Monitor className="w-3 h-3 mr-2" />
                  Paramètres d'affichage
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay pour fermer les panneaux */}
      {(showVolumePanel || showSystemPanel) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowVolumePanel(false)
            setShowSystemPanel(false)
          }}
        />
      )}
    </div>
  )
} 