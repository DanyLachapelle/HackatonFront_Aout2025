import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { fileService } from "@/services/file-service"
import type { FileItem } from "@/types/file-types"
import { config } from "@/config/environment"

import { 
  PlayIcon, 
  PauseIcon, 
  SkipBackIcon, 
  SkipForwardIcon, 
  Volume2Icon,
  VolumeXIcon,
  ShuffleIcon,
  RepeatIcon,
  ListIcon,
  HeartIcon,
  DownloadIcon,
  PlusIcon,
  MusicIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  SearchIcon
} from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  url?: string
  cover?: string
  isLiked: boolean
  filePath?: string
  fileSize?: number
}

interface MusicPlayerProps {
  windowId?: string
}

export function MusicPlayer({ windowId }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<"none" | "one" | "all">("none")
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Playlist chargée depuis l'arborescence
  const [playlist, setPlaylist] = useState<Song[]>([])

  // Charger les fichiers musicaux au démarrage
  useEffect(() => {
    loadMusicFiles()
  }, [])

  const loadMusicFiles = async () => {
    try {
      setIsLoading(true)
      // Charger les fichiers depuis le dossier système Musique
      const musicFiles = await fileService.listFiles('/musique')
      
      // Filtrer pour ne garder que les fichiers audio
      const audioFiles = musicFiles.filter(file => 
        file.contentType?.startsWith('audio/') || 
        ['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(file.name.split('.').pop()?.toLowerCase() || '')
      )
      
      // Convertir les FileItem en Song
      const songs: Song[] = audioFiles.map((file, index) => {
        const fileName = file.name.replace(/\.[^/.]+$/, "") // Enlever l'extension
        const extension = file.name.split('.').pop()?.toLowerCase()
        
        return {
          id: file.id,
          title: fileName,
          artist: "Artiste inconnu",
          album: "Album inconnu",
          duration: Math.floor(Math.random() * 300) + 120, // Durée aléatoire entre 2-7 minutes
          url: `${config.apiUrl}/download?path=${encodeURIComponent(file.path)}&userId=1`, // URL complète du backend
          cover: `https://via.placeholder.com/150/1f2937/ffffff?text=${encodeURIComponent(fileName)}`,
          isLiked: Math.random() > 0.7, // 30% de chance d'être aimé
          filePath: file.path,
          fileSize: file.size
        }
      })
      
      setPlaylist(songs)
      console.log(`Chargé ${songs.length} fichiers musicaux depuis le dossier Musique`)
    } catch (error) {
      console.error("Erreur lors du chargement des fichiers musicaux:", error)
      // Fallback vers la playlist d'exemple si erreur
      setPlaylist([
        {
          id: "1",
          title: "Bohemian Rhapsody",
          artist: "Queen",
          album: "A Night at the Opera",
          duration: 354,
          cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Queen",
          isLiked: true
        },
        {
          id: "2",
          title: "Hotel California",
          artist: "Eagles",
          album: "Hotel California",
          duration: 391,
          cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Eagles",
          isLiked: false
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const currentSong = playlist[currentSongIndex]

  // Gestion de l'audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => handleNext()

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  // Mise à jour du volume
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    if (currentTime > 3) {
      // Si on est plus de 3 secondes dans la chanson, revenir au début
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        setCurrentTime(0)
      }
    } else {
      // Sinon, passer à la chanson précédente
      const newIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1
      setCurrentSongIndex(newIndex)
    }
  }

  const handleNext = () => {
    let newIndex: number

    if (shuffle) {
      // Mode aléatoire
      do {
        newIndex = Math.floor(Math.random() * playlist.length)
      } while (newIndex === currentSongIndex && playlist.length > 1)
    } else {
      // Mode normal
      newIndex = currentSongIndex === playlist.length - 1 ? 0 : currentSongIndex + 1
    }

    setCurrentSongIndex(newIndex)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
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

  const toggleShuffle = () => {
    setShuffle(!shuffle)
  }

  const toggleRepeat = () => {
    setRepeat(repeat === "none" ? "all" : repeat === "all" ? "one" : "none")
  }

  const toggleLike = (songId: string) => {
    setPlaylist(prev => prev.map(song => 
      song.id === songId ? { ...song, isLiked: !song.isLiked } : song
    ))
  }

  const playSong = (index: number) => {
    setCurrentSongIndex(index)
    setIsPlaying(true)
    // Dans une vraie app, on chargerait l'audio ici
  }

  const filteredPlaylist = playlist.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Panneau principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <div className="p-6 text-white border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <MusicIcon className="w-6 h-6 text-white" />
              </div>
              Lecteur de musique
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="text-white hover:bg-white/10 rounded-lg"
            >
              <ListIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 text-white/80">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent"></div>
                <span className="font-medium">Recherche de fichiers musicaux dans l'arborescence...</span>
              </div>
            </div>
          )}

          {/* Statistiques */}
          {!isLoading && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FolderIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold">{playlist.length} fichiers musicaux trouvés</span>
                  <p className="text-sm text-white/70">Scanné dans l'arborescence</p>
                </div>
              </div>
            </div>
          )}

          {/* Recherche */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              placeholder="Rechercher une chanson, artiste ou album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-purple-400 rounded-xl"
            />
          </div>
        </div>

        {/* Zone principale */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardContent className="p-8 text-white">
              {/* Pochette d'album */}
              <div className="text-center mb-8">
                <div className="w-80 h-80 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-2xl">
                  {currentSong?.cover ? (
                    <img 
                      src={currentSong.cover} 
                      alt={currentSong?.album}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MusicIcon className="w-32 h-32 text-white/60" />
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de la chanson */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {currentSong?.title || "Aucune chanson sélectionnée"}
                </h2>
                <p className="text-xl text-white/80 mb-2">{currentSong?.artist || "Artiste inconnu"}</p>
                <p className="text-lg text-white/60">{currentSong?.album || "Album inconnu"}</p>
                {currentSong?.filePath && (
                  <p className="text-sm text-white/40 mt-2 font-mono">{currentSong.filePath}</p>
                )}
              </div>

              {/* Barre de progression */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-white/60 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
              </div>

              {/* Contrôles de lecture */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={toggleShuffle}
                  className={`text-white hover:bg-white/10 rounded-full p-3 ${shuffle ? 'bg-purple-500/20 text-purple-300' : ''}`}
                >
                  <ShuffleIcon className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePrevious}
                  className="text-white hover:bg-white/10 rounded-full p-3"
                >
                  <SkipBackIcon className="w-8 h-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePlayPause}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full p-4 shadow-lg"
                >
                  {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleNext}
                  className="text-white hover:bg-white/10 rounded-full p-3"
                >
                  <SkipForwardIcon className="w-8 h-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={toggleRepeat}
                  className={`text-white hover:bg-white/10 rounded-full p-3 ${repeat !== "none" ? 'bg-purple-500/20 text-purple-300' : ''}`}
                >
                  <RepeatIcon className="w-6 h-6" />
                </Button>
              </div>

              {/* Contrôles de volume */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/10 rounded-lg"
                >
                  {isMuted ? <VolumeXIcon className="w-5 h-5" /> : <Volume2Icon className="w-5 h-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="w-80 bg-white/5 backdrop-blur-sm border-l border-white/10">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ListIcon className="w-5 h-5" />
              Playlist ({filteredPlaylist.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredPlaylist.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <MusicIcon className="w-12 h-12 mx-auto mb-3" />
                <p>Aucune chanson trouvée</p>
              </div>
            ) : (
              filteredPlaylist.map((song, index) => (
                <div
                  key={song.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                    index === currentSongIndex
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/50'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                  onClick={() => playSong(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                      {song.cover ? (
                        <img src={song.cover} alt={song.album} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MusicIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{song.title}</h3>
                      <p className="text-sm text-white/70 truncate">{song.artist}</p>
                      <p className="text-xs text-white/50 truncate">{song.album}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(song.id)
                        }}
                        className={`p-1 rounded-full ${
                          song.isLiked ? 'text-red-400 hover:text-red-300' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <HeartIcon className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-white/50">{formatTime(song.duration)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 