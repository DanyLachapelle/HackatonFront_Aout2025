import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { config } from "@/config/environment"
import { 
  PlayIcon, 
  PauseIcon, 
  SkipBackIcon, 
  SkipForwardIcon, 
  Volume2Icon,
  VolumeXIcon,
  XIcon,
  MinusIcon,
  MusicIcon
} from "lucide-react"

interface MiniMusicPlayerProps {
  windowId?: string
  filePath?: string
  fileName?: string
}

export function MiniMusicPlayer({ windowId, filePath, fileName }: MiniMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const trackTitle = fileName ? fileName.replace(/\.[^/.]+$/, "") : "Piste audio"
  const audioUrl = filePath ? `${config.apiUrl}/files/download?path=${encodeURIComponent(filePath)}&userId=1&inline=true` : null

  // Charger l'audio au démarrage
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => {
      setIsLoading(false)
      setError(null)
    }
    const handleError = (e: any) => {
      setIsLoading(false)
      console.error("Erreur de chargement audio:", e)
      console.log("URL tentée:", audioUrl)
      setError("Impossible de charger le fichier audio. Vérifiez que le backend est démarré.")
    }
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.src = audioUrl
    audio.volume = volume

    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    // Auto-play quand prêt
    audio.addEventListener("canplay", () => {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setError("Lecture automatique bloquée - cliquez sur Play")
      })
    }, { once: true })

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioUrl]) // Retirer 'volume' de la dépendance

  // Mise à jour du volume
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
        setError(null)
      }).catch(() => {
        setError("Erreur de lecture")
      })
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio && isFinite(value[0])) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100)
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleRewind = () => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    }
  }

  const handleForward = () => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <audio ref={audioRef} preload="metadata" />

      {/* Contenu principal */}
      <div className="flex-1 p-4">
        {/* Titre de la chanson */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MusicIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white truncate">{trackTitle}</h3>
          </div>
          <p className="text-xs text-gray-400">
            {isLoading ? "Chargement..." : error ? "Erreur" : isPlaying ? "En cours de lecture" : "En pause"}
          </p>
        </div>

        {/* État du chargement/erreur */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 mb-4 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm">Chargement...</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Visualisation audio simple */}
        <div className="mb-4 h-16 bg-gray-800 rounded flex items-center justify-center">
          <div className="flex items-end gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${Math.random() * 40 + 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-300 mb-2">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
          <div className="relative">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            {/* Curseur de position */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-all duration-300 cursor-pointer hover:scale-110"
              style={{ 
                left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 8px)`,
                opacity: duration > 0 ? 1 : 0
              }}
            />
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isLoading || !!error}
            />
          </div>
        </div>

        {/* Contrôles de lecture */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRewind}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-colors"
            disabled={isLoading || !!error}
            title="Reculer de 10s"
          >
            <SkipBackIcon className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-3 shadow-lg transform transition-all duration-200 hover:scale-105"
            disabled={isLoading || !!error}
          >
            {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForward}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-colors"
            disabled={isLoading || !!error}
            title="Avancer de 10s"
          >
            <SkipForwardIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Contrôle de volume */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded"
          >
            {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
          </Button>
          <div className="flex-1 relative">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
            {/* Curseur de volume */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-green-500 transition-all duration-300 cursor-pointer hover:scale-110"
              style={{ 
                left: `calc(${isMuted ? 0 : volume * 100}% - 6px)`,
                opacity: 1
              }}
            />
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-gray-300 w-10 text-right font-mono">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* Info fichier - simplifié */}
      <div className="px-3 py-2 bg-gray-800/50 border-t border-gray-600">
        <div className="text-xs text-gray-400 truncate text-center">
          {isLoading ? "Chargement..." : error ? "Erreur de lecture" : isPlaying ? "♪ En lecture" : "⏸ En pause"}
        </div>
      </div>
    </div>
  )
}
