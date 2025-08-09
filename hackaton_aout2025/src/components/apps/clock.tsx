import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotificationStore } from "@/stores/notification-store"

export function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [timerTime, setTimerTime] = useState(0)
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerMinutesInput, setTimerMinutesInput] = useState("")
  const [timerSecondsInput, setTimerSecondsInput] = useState("")
  const [timerName, setTimerName] = useState("Minuteur") // Nom du minuteur pour les notifications
  const [isAppInBackground, setIsAppInBackground] = useState(false) // État de l'application
  const stopwatchRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  
  const { addNotification } = useNotificationStore()

  // Détecter si l'application est en arrière-plan
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppInBackground(document.hidden)
    }

    const handleBlur = () => {
      setIsAppInBackground(true)
    }

    const handleFocus = () => {
      setIsAppInBackground(false)
    }

    // Écouter les changements de visibilité de la page
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Écouter les changements de focus de la fenêtre
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Chronomètre
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 10)
      }, 10)
    } else {
      if (stopwatchRef.current) {
        clearInterval(stopwatchRef.current)
      }
    }

    return () => {
      if (stopwatchRef.current) {
        clearInterval(stopwatchRef.current)
      }
    }
  }, [isStopwatchRunning])

  // Minuteur
  useEffect(() => {
    if (isTimerRunning && timerTime > 0) {
      timerRef.current = setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 1000) {
            setIsTimerRunning(false)
            // Jouer un son d'alarme
            playAlarmSound()
            // Envoyer une notification
            sendTimerNotification()
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, timerTime])

  const sendTimerNotification = () => {
    // Envoyer la notification seulement si l'application est en arrière-plan
    if (isAppInBackground) {
      const minutes = Math.floor(timerTime / 60000)
      const seconds = Math.floor((timerTime % 60000) / 1000)
      const duration = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : `${seconds} seconde${seconds > 1 ? 's' : ''}`
      
      addNotification({
        title: `⏰ ${timerName} terminé`,
        message: `Le minuteur de ${duration} est terminé !`,
        type: 'info',
        category: 'timer'
      })
    }
  }

  const playAlarmSound = () => {
    // Créer un son d'alarme simple
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600000)
    const minutes = Math.floor((time % 3600000) / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = Math.floor((time % 1000) / 10)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  const formatTimer = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const startStopwatch = () => {
    setIsStopwatchRunning(true)
  }
  
  const stopStopwatch = () => {
    if (isStopwatchRunning) {
      setIsStopwatchRunning(false)
    }
  }
  
  const resetStopwatch = () => {
    if (stopwatchTime > 0) {
      setStopwatchTime(0)
      setIsStopwatchRunning(false)
    }
  }

  const startTimer = () => {
    if (timerTime > 0) {
      setIsTimerRunning(true)
    }
  }

  const stopTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false)
    }
  }
  
  const resetTimer = () => {
    if (timerTime > 0) {
      setTimerTime(0)
      setIsTimerRunning(false)
    }
  }

  const setTimer = () => {
    const minutes = parseInt(timerMinutesInput) || 0
    const seconds = parseInt(timerSecondsInput) || 0
    
    // Validation : au moins 1 seconde doit être définie
    if ((minutes > 0 || seconds > 0) && minutes >= 0 && seconds >= 0 && seconds < 60) {
      const totalMilliseconds = (minutes * 60 + seconds) * 1000
      setTimerTime(totalMilliseconds)
      setTimerMinutesInput("")
      setTimerSecondsInput("")
    }
  }

  const quickTimer = (minutes: number, seconds: number = 0) => {
    const totalMilliseconds = (minutes * 60 + seconds) * 1000
    setTimerTime(totalMilliseconds)
    setIsTimerRunning(true)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Tabs defaultValue="clock" className="w-full h-full flex flex-col">
        <div className="p-4 pb-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clock">Horloge</TabsTrigger>
            <TabsTrigger value="stopwatch">Chronomètre</TabsTrigger>
            <TabsTrigger value="timer">Minuteur</TabsTrigger>
          </TabsList>
        </div>

        {/* Horloge */}
        <TabsContent value="clock" className="flex-1 px-4 pb-4 overflow-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-center">Horloge</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full space-y-6">
              {/* Heure principale */}
              <div className="text-center">
                <div className="text-6xl font-light text-gray-800 dark:text-white">
                  {currentTime.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                  {currentTime.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow w-full max-w-md">
                <div className="text-sm text-gray-500 dark:text-gray-400">Fuseau horaire</div>
                <div className="text-lg font-semibold">Europe/Paris</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chronomètre */}
        <TabsContent value="stopwatch" className="flex-1 px-4 pb-4 overflow-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-center">Chronomètre</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full space-y-6">
              {/* Affichage du temps */}
              <div className="text-center">
                <div className="text-5xl font-mono text-gray-800 dark:text-white">
                  {formatTime(stopwatchTime)}
                </div>
              </div>

              {/* Boutons de contrôle */}
              <div className="flex space-x-4">
                {!isStopwatchRunning ? (
                  <Button onClick={startStopwatch} className="bg-green-500 hover:bg-green-600" title="Démarrer le chronomètre">
                    Démarrer
                  </Button>
                ) : (
                  <Button onClick={stopStopwatch} className="bg-red-500 hover:bg-red-600" title="Mettre en pause le chronomètre">
                    Pause
                  </Button>
                )}
                <Button onClick={resetStopwatch} variant="outline" title="Remettre le chronomètre à zéro">
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Minuteur */}
        <TabsContent value="timer" className="flex-1 px-4 pb-4 overflow-auto">
          <Card className="h-full min-h-0 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-center">Minuteur</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-3 overflow-auto flex-1 py-2">
              {/* Affichage du temps restant */}
              <div className="text-center flex-shrink-0">
                <div className="text-4xl sm:text-6xl font-mono text-gray-800 dark:text-white">
                  {formatTimer(timerTime)}
                </div>
              </div>

              {/* Configuration du minuteur */}
              <div className="space-y-2 w-full max-w-sm flex-shrink-0">
                {/* Nom du minuteur */}
                <div className="flex items-center space-x-2">
                  <Label htmlFor="timer-name">Nom:</Label>
                  <Input
                    id="timer-name"
                    type="text"
                    value={timerName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimerName(e.target.value)}
                    className="flex-1"
                    placeholder="Nom du minuteur"
                  />
                </div>
                
                {/* Durée du minuteur - Minutes et Secondes */}
                <div className="space-y-2">
                  <Label>Durée:</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Input
                        type="number"
                        value={timerMinutesInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimerMinutesInput(e.target.value)}
                        className="w-16 text-center"
                        min="0"
                        max="999"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-600">min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Input
                        type="number"
                        value={timerSecondsInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimerSecondsInput(e.target.value)}
                        className="w-16 text-center"
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-600">sec</span>
                    </div>
                    <Button 
                      onClick={setTimer} 
                      disabled={!timerMinutesInput && !timerSecondsInput}
                      size="sm"
                    >
                      Définir
                    </Button>
                  </div>

                </div>
              </div>

              {/* Boutons de contrôle */}
              <div className="flex space-x-4 flex-shrink-0">
                {!isTimerRunning ? (
                  <Button onClick={startTimer} disabled={timerTime === 0} className="bg-green-500 hover:bg-green-600" title="Démarrer le minuteur">
                    Démarrer
                  </Button>
                ) : (
                  <Button onClick={stopTimer} className="bg-red-500 hover:bg-red-600" title="Mettre en pause le minuteur">
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} variant="outline" title="Remettre le minuteur à zéro">
                  Réinitialiser
                </Button>
              </div>

              {/* Minuteurs rapides */}
              <div className="space-y-2 w-full min-h-0">
                <Label className="text-sm font-medium">Minuteurs rapides:</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-w-xs mx-auto">
                  <Button 
                    onClick={() => quickTimer(0, 30)} 
                    variant="outline" 
                    size="sm"
                    disabled={isTimerRunning}
                    title="Définir un minuteur de 30 secondes"
                    className="text-xs h-8"
                  >
                    30s
                  </Button>
                  <Button 
                    onClick={() => quickTimer(1, 0)} 
                    variant="outline" 
                    size="sm"
                    disabled={isTimerRunning}
                    title="Définir un minuteur de 1 minute"
                    className="text-xs h-8"
                  >
                    1 min
                  </Button>
                  <Button 
                    onClick={() => quickTimer(1, 30)} 
                    variant="outline" 
                    size="sm"
                    disabled={isTimerRunning}
                    title="Définir un minuteur de 1 minute 30 secondes"
                    className="text-xs h-8"
                  >
                    1m30s
                  </Button>
                  <Button 
                    onClick={() => quickTimer(5, 0)} 
                    variant="outline" 
                    size="sm"
                    disabled={isTimerRunning}
                    title="Définir un minuteur de 5 minutes"
                    className="text-xs h-8"
                  >
                    5 min
                  </Button>
                  <Button 
                    onClick={() => quickTimer(10, 0)} 
                    variant="outline" 
                    size="sm"
                    disabled={isTimerRunning}
                    title="Définir un minuteur de 10 minutes"
                    className="text-xs h-8"
                  >
                    10 min
                  </Button>
                  <Button 
                    onClick={() => quickTimer(15, 0)} 
                    variant="outline" 
                    size="sm"
                    disabled={isTimerRunning}
                    title="Définir un minuteur de 15 minutes"
                    className="text-xs h-8"
                  >
                    15 min
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 