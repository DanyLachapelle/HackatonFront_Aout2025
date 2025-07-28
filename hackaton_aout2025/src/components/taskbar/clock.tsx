import { useState, useEffect } from "react"
import { Calendar, Clock as ClockIcon } from "lucide-react"

export function Clock() {
  const [time, setTime] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCurrentMonth = () => {
    const year = time.getFullYear()
    const month = time.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  return (
    <div className="relative">
      <div 
        className="text-white text-sm cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <div className="text-center font-medium">
          {formatTime(time)}
        </div>
        <div className="text-xs text-gray-300">
          {formatDate(time)}
        </div>
      </div>

      {/* Calendrier popup */}
      {showCalendar && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {monthNames[time.getMonth()]} {time.getFullYear()}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-4 h-4" />
              <span>{formatTime(time)}</span>
            </div>
          </div>

          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            {formatFullDate(time)}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {dayNames.map(day => (
              <div key={day} className="text-center text-gray-500 dark:text-gray-400 font-medium py-1">
                {day}
              </div>
            ))}
            {getCurrentMonth().map((day, index) => (
              <div
                key={index}
                className={`text-center py-1 rounded ${
                  day === null
                    ? "text-transparent"
                    : day === time.getDate()
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Semaine {Math.ceil((time.getDate() + new Date(time.getFullYear(), time.getMonth(), 1).getDay()) / 7)}</div>
              <div>Jour {time.getDay() === 0 ? 7 : time.getDay()} de la semaine</div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {showCalendar && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowCalendar(false)}
        />
      )}
    </div>
  )
} 