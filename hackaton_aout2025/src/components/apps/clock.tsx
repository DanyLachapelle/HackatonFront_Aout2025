import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [timerTime, setTimerTime] = useState(0)
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerInput, setTimerInput] = useState("")
  const stopwatchRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

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

  const startStopwatch = () => setIsStopwatchRunning(true)
  const stopStopwatch = () => setIsStopwatchRunning(false)
  const resetStopwatch = () => {
    setStopwatchTime(0)
    setIsStopwatchRunning(false)
  }

  const startTimer = () => {
    if (timerTime > 0) {
      setIsTimerRunning(true)
    }
  }

  const stopTimer = () => setIsTimerRunning(false)
  const resetTimer = () => {
    setTimerTime(0)
    setIsTimerRunning(false)
  }

  const setTimer = () => {
    const minutes = parseInt(timerInput)
    if (!isNaN(minutes) && minutes > 0) {
      setTimerTime(minutes * 60000)
      setTimerInput("")
    }
  }

  const quickTimer = (minutes: number) => {
    setTimerTime(minutes * 60000)
    setIsTimerRunning(true)
  }

  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Tabs defaultValue="clock" className="w-full h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clock">Horloge</TabsTrigger>
          <TabsTrigger value="stopwatch">Chronomètre</TabsTrigger>
          <TabsTrigger value="timer">Minuteur</TabsTrigger>
        </TabsList>

        {/* Horloge */}
        <TabsContent value="clock" className="h-full">
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
        <TabsContent value="stopwatch" className="h-full">
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
        <TabsContent value="timer" className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-center">Minuteur</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full space-y-6">
              {/* Affichage du temps restant */}
              <div className="text-center">
                <div className="text-6xl font-mono text-gray-800 dark:text-white">
                  {formatTimer(timerTime)}
                </div>
              </div>

              {/* Configuration du minuteur */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="timer-input">Minutes:</Label>
                <Input
                  id="timer-input"
                  type="number"
                  value={timerInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimerInput(e.target.value)}
                  className="w-20"
                  min="1"
                  max="999"
                />
                <Button onClick={setTimer} disabled={!timerInput}>
                  Définir
                </Button>
              </div>

              {/* Boutons de contrôle */}
              <div className="flex space-x-4">
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
              <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                <Button 
                  onClick={() => quickTimer(5)} 
                  variant="outline" 
                  size="sm"
                  disabled={isTimerRunning}
                  title="Définir un minuteur de 5 minutes"
                >
                  5 min
                </Button>
                <Button 
                  onClick={() => quickTimer(10)} 
                  variant="outline" 
                  size="sm"
                  disabled={isTimerRunning}
                  title="Définir un minuteur de 10 minutes"
                >
                  10 min
                </Button>
                <Button 
                  onClick={() => quickTimer(15)} 
                  variant="outline" 
                  size="sm"
                  disabled={isTimerRunning}
                  title="Définir un minuteur de 15 minutes"
                >
                  15 min
                </Button>
                <Button 
                  onClick={() => quickTimer(30)} 
                  variant="outline" 
                  size="sm"
                  disabled={isTimerRunning}
                >
                  30 min
                </Button>
                <Button 
                  onClick={() => quickTimer(45)} 
                  variant="outline" 
                  size="sm"
                  disabled={isTimerRunning}
                >
                  45 min
                </Button>
                <Button 
                  onClick={() => quickTimer(60)} 
                  variant="outline" 
                  size="sm"
                  disabled={isTimerRunning}
                >
                  1h
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 