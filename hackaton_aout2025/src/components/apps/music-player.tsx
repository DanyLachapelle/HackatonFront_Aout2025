import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
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
  UserIcon
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
}

export function MusicPlayer() {
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

  // Playlist d'exemple avec des chansons fictives
  const [playlist, setPlaylist] = useState<Song[]>([
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
    },
    {
      id: "3",
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      album: "Led Zeppelin IV",
      duration: 482,
      cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Zeppelin",
      isLiked: true
    },
    {
      id: "4",
      title: "Imagine",
      artist: "John Lennon",
      album: "Imagine",
      duration: 183,
      cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Lennon",
      isLiked: false
    },
    {
      id: "5",
      title: "Hey Jude",
      artist: "The Beatles",
      album: "Single",
      duration: 431,
      cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Beatles",
      isLiked: true
    },
    {
      id: "6",
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      album: "Nevermind",
      duration: 301,
      cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Nirvana",
      isLiked: false
    },
    {
      id: "7",
      title: "Wonderwall",
      artist: "Oasis",
      album: "(What's the Story) Morning Glory?",
      duration: 258,
      cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Oasis",
      isLiked: true
    },
    {
      id: "8",
      title: "Creep",
      artist: "Radiohead",
      album: "Pablo Honey",
      duration: 239,
      cover: "https://via.placeholder.com/150/1f2937/ffffff?text=Radiohead",
      isLiked: false
    }
  ])

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
    setVolume(value[0])
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
    <div className="flex h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Panneau principal */}
      <div className="flex-1 flex flex-col">
        {/* En-tête */}
        <div className="p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MusicIcon className="w-6 h-6" />
              Lecteur de musique
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="text-white hover:bg-white/10"
            >
              <ListIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Recherche */}
          <div className="mb-6">
            <Input
              placeholder="Rechercher une chanson, artiste ou album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>

        {/* Zone principale */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-white">
              {/* Pochette d'album */}
              <div className="text-center mb-6">
                <div className="w-64 h-64 mx-auto mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {currentSong?.cover ? (
                    <img 
                      src={currentSong.cover} 
                      alt={currentSong?.album}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MusicIcon className="w-24 h-24 text-white/60" />
                  )}
                </div>
              </div>

              {/* Informations de la chanson */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">{currentSong?.title || "Aucune chanson"}</h2>
                <p className="text-white/80 mb-1">{currentSong?.artist || "Artiste inconnu"}</p>
                <p className="text-white/60 text-sm">{currentSong?.album || "Album inconnu"}</p>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={duration}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-white/60 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Contrôles principaux */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleShuffle}
                  className={`text-white hover:bg-white/10 ${shuffle ? 'bg-white/20' : ''}`}
                >
                  <ShuffleIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="text-white hover:bg-white/10"
                  title="Morceau précédent"
                >
                  <SkipBackIcon className="w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="bg-white text-purple-900 hover:bg-white/90 w-16 h-16 rounded-full"
                  title={isPlaying ? "Pause" : "Lecture"}
                >
                  {isPlaying ? (
                    <PauseIcon className="w-8 h-8" />
                  ) : (
                    <PlayIcon className="w-8 h-8" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="text-white hover:bg-white/10"
                  title="Morceau suivant"
                >
                  <SkipForwardIcon className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRepeat}
                  className={`text-white hover:bg-white/10 ${repeat !== 'none' ? 'bg-white/20' : ''}`}
                  title={`Répéter: ${repeat === 'none' ? 'Désactivé' : repeat === 'one' ? 'Morceau actuel' : 'Toute la playlist'}`}
                >
                  <RepeatIcon className="w-5 h-5" />
                  {repeat === 'one' && <span className="text-xs ml-1">1</span>}
                </Button>
              </div>

              {/* Contrôles secondaires */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(currentSong?.id || "")}
                    className={`text-white hover:bg-white/10 ${currentSong?.isLiked ? 'text-red-400' : ''}`}
                    title={currentSong?.isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <HeartIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    title="Télécharger le morceau"
                  >
                    <DownloadIcon className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/10"
                    title={isMuted ? "Activer le son" : "Couper le son"}
                  >
                    {isMuted ? (
                      <VolumeXIcon className="w-5 h-5" />
                    ) : (
                      <Volume2Icon className="w-5 h-5" />
                    )}
                  </Button>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="w-80 bg-white/10 backdrop-blur-sm border-l border-white/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Playlist</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPlaylist.map((song, index) => (
                <div
                  key={song.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentSongIndex
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  onClick={() => playSong(index)}
                >
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {song.cover ? (
                      <img 
                        src={song.cover} 
                        alt={song.album}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <MusicIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-white/60 truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(song.id)
                      }}
                      className={`p-1 ${song.isLiked ? 'text-red-400' : 'text-white/60'}`}
                    >
                      <HeartIcon className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-white/60">
                      {formatTime(song.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audio element (caché) */}
      <audio ref={audioRef} />
    </div>
  )
} 