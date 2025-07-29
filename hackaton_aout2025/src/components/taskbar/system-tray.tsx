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