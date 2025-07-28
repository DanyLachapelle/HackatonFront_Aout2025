import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  description?: string
  color: string
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", description: "", color: "#3b82f6" })

  // Couleurs pour les événements
  const eventColors = [
    "#3b82f6", // Bleu
    "#ef4444", // Rouge
    "#10b981", // Vert
    "#f59e0b", // Orange
    "#8b5cf6", // Violet
    "#ec4899", // Rose
  ]

  // Navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Ajouter les jours du mois précédent
    for (let i = 0; i < startingDay; i++) {
      const prevMonth = new Date(year, month - 1, 0)
      const day = prevMonth.getDate() - startingDay + i + 1
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: false,
      })
    }

    // Ajouter les jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === new Date().toDateString()
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
      })
    }

    // Ajouter les jours du mois suivant
    const remainingDays = 42 - days.length // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return days
  }

  // Obtenir les événements pour une date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
  }

  // Ajouter un événement
  const addEvent = () => {
    if (selectedDate && newEvent.title.trim()) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: selectedDate.toISOString().split('T')[0],
        color: newEvent.color,
      }
      setEvents([...events, event])
      setNewEvent({ title: "", description: "", color: "#3b82f6" })
      setShowEventForm(false)
    }
  }

  // Supprimer un événement
  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId))
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={goToPreviousMonth} variant="outline" size="sm" title="Mois précédent">
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button onClick={goToToday} variant="outline" size="sm" title="Aller à aujourd'hui">
                Aujourd'hui
              </Button>
              <Button onClick={goToNextMonth} variant="outline" size="sm" title="Mois suivant">
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 flex-1">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date)
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()

              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border border-gray-200 dark:border-gray-700 cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                    ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
                    ${day.isToday ? 'bg-blue-100 dark:bg-blue-900' : ''}
                    ${isSelected ? 'bg-blue-200 dark:bg-blue-800' : ''}
                  `}
                  onClick={() => {
                    setSelectedDate(day.date)
                    setShowEventForm(true)
                  }}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date.getDate()}
                  </div>
                  
                  {/* Événements */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Formulaire d'ajout d'événement */}
          {showEventForm && selectedDate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Ajouter un événement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <div className="text-sm text-gray-600">
                      {selectedDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Titre</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="Titre de l'événement"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Description (optionnel)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Couleur</label>
                    <div className="flex space-x-2">
                      {eventColors.map(color => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full border-2 ${
                            newEvent.color === color ? 'border-gray-800' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewEvent({ ...newEvent, color })}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={addEvent} disabled={!newEvent.title.trim()} title="Ajouter l'événement au calendrier">
                      Ajouter
                    </Button>
                    <Button onClick={() => setShowEventForm(false)} variant="outline" title="Annuler l'ajout d'événement">
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Liste des événements du jour sélectionné */}
          {selectedDate && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-2">
                Événements du {selectedDate.toLocaleDateString('fr-FR')}
              </h3>
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucun événement pour cette date
                </p>
              ) : (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 rounded border"
                      style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                    >
                      <div>
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {event.description}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => deleteEvent(event.id)}
                        variant="ghost"
                        size="sm"
                        title="Supprimer cet événement"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 