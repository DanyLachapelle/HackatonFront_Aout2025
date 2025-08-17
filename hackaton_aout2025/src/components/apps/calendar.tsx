import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, BellIcon } from "lucide-react"
import { calendarService, type CalendarEvent } from "@/services/calendar-service"
import { reminderService, type Reminder } from "@/services/reminder-service"
import { ErrorBoundary } from "@/components/error-boundary"
import { useCustomAlert, CustomAlert } from "@/components/ui/custom-alert"

interface Event {
  id: string
  title: string
  date: string
  startDate: string
  endDate: string
  description?: string
  color: string
  isAllDay: boolean
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ 
    title: "", 
    description: "", 
    color: "#3b82f6",
    enableReminders: true,
    startTime: "09:00",
    endTime: "10:00",
    isAllDay: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null) // ID de l'événement en cours de suppression
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const { showError, showSuccess, alert, hideAlert } = useCustomAlert()

  // Charger les événements depuis le backend au démarrage
  useEffect(() => {
    loadEventsFromBackend()
  }, [])

  const loadEventsFromBackend = async () => {
    try {
      setIsLoading(true)
      console.log('Chargement des événements depuis le backend...')
      const backendEvents = await calendarService.getEvents()
      
      // Convertir les CalendarEvent du backend en Event du frontend
      const convertedEvents: Event[] = backendEvents.map(event => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        date: event.startDate.split('T')[0], // Extraire juste la date
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        color: event.color,
        isAllDay: event.isAllDay || false
      }))
      
      setEvents(convertedEvents)
      console.log(`Chargé ${convertedEvents.length} événements depuis le backend`)
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      // En cas d'erreur, initialiser avec un tableau vide
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

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
    if (!events || events.length === 0) return []
    
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => {
      // Utiliser la propriété 'date' qui est cohérente avec la création d'événement
      if (!event.date) return false
      return event.date === dateString
    })
  }
  
  // Formater l'heure d'un événement
  const formatEventTime = (event: Event) => {
    if (!event || event.isAllDay) return ''
    if (!event.startDate || !event.endDate) return ''
    
    try {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      
      const startTime = startDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      const endTime = endDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      return `${startTime} - ${endTime}`
    } catch (error) {
      console.error('Erreur lors du formatage de l\'heure:', error)
      return ''
    }
  }

  // Ajouter un événement
  const addEvent = async () => {
    if (selectedDate && newEvent.title.trim()) {
      try {
        console.log('Création d\'un nouvel événement...')
        
        // Préparer les dates avec heures
        let startDate: string
        let endDate: string
        
        if (newEvent.isAllDay) {
          startDate = calendarService.formatDateForAPI(selectedDate)
          endDate = calendarService.formatDateForAPI(selectedDate)
        } else {
          // Combiner la date sélectionnée avec l'heure
          const startDateTime = new Date(selectedDate)
          const [startHour, startMinute] = newEvent.startTime.split(':')
          startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0)
          
          const endDateTime = new Date(selectedDate)
          const [endHour, endMinute] = newEvent.endTime.split(':')
          endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0)
          
          startDate = startDateTime.toISOString()
          endDate = endDateTime.toISOString()
        }
        
        // Créer l'événement dans le backend
        const backendEvent = await calendarService.createEvent({
          title: newEvent.title,
          description: newEvent.description,
          startDate: startDate,
          endDate: endDate,
          color: newEvent.color,
          isAllDay: newEvent.isAllDay,
          userId: 1 // TODO: Récupérer depuis l'authentification
        })
        
        if (backendEvent) {
          // Ajouter l'événement créé à la liste locale
          const event: Event = {
            id: backendEvent.id.toString(),
            title: newEvent.title,
            description: newEvent.description,
            date: selectedDate.toISOString().split('T')[0],
            startDate: startDate,
            endDate: endDate,
            color: newEvent.color,
            isAllDay: newEvent.isAllDay
          }
          setEvents([...events, event])
          console.log('Événement créé avec succès dans le backend')
          
          // Créer automatiquement des rappels par défaut si activé
          if (newEvent.enableReminders) {
            const calendarEvent: CalendarEvent = {
              id: backendEvent.id,
              title: newEvent.title,
              description: newEvent.description || '',
              startDate: startDate,
              endDate: endDate,
              color: newEvent.color,
              location: '',
              isAllDay: newEvent.isAllDay
            }
            
            // Créer un rappel 15 minutes avant par défaut
            reminderService.createReminder(calendarEvent, '15min')
            console.log('Rappel automatique créé pour l\'événement')
          }
        } else {
          console.error('Échec de la création de l\'événement dans le backend')
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error)
        showError('Erreur de création', 'Impossible de créer l\'événement. Veuillez réessayer.')
      }
      
      setNewEvent({ 
        title: "", 
        description: "", 
        color: "#3b82f6", 
        enableReminders: true,
        startTime: "09:00",
        endTime: "10:00",
        isAllDay: false
      })
      setShowEventForm(false)
    }
  }

  // Supprimer un événement
  const deleteEvent = async (eventId: string) => {
    try {
      console.log(`Suppression de l'événement ${eventId}...`)
      
      // Demander confirmation à l'utilisateur
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        return
      }
      
      // Indiquer que la suppression est en cours
      setIsDeleting(eventId)
      
      // Supprimer du backend
      const success = await calendarService.deleteEvent(parseInt(eventId))
      
      if (success) {
        // Supprimer les rappels associés
        try {
          reminderService.deleteEventReminders(eventId)
        } catch (reminderError) {
          console.warn('Erreur lors de la suppression des rappels:', reminderError)
          // Continuer même si la suppression des rappels échoue
        }
        
        // Supprimer de la liste locale
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
        console.log('Événement supprimé avec succès du backend')
        
        // Recharger les événements pour s'assurer de la synchronisation
        await loadEventsFromBackend()
        
        // Afficher une notification de succès
        showSuccess('Événement supprimé', 'L\'événement a été supprimé avec succès.')
      } else {
        console.error('Échec de la suppression de l\'événement dans le backend')
        showError('Erreur de suppression', 'Impossible de supprimer l\'événement. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      showError('Erreur de suppression', 'Une erreur inattendue s\'est produite lors de la suppression.')
    } finally {
      // Réinitialiser l'état de suppression
      setIsDeleting(null)
    }
  }

  const addReminder = (event: Event) => {
    setSelectedEvent(event)
    setShowReminderDialog(true)
  }

  const createReminder = (type: Reminder['type']) => {
    if (!selectedEvent) return

    // Convertir l'Event en CalendarEvent pour le service
    const calendarEvent: CalendarEvent = {
      id: parseInt(selectedEvent.id),
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      startDate: selectedEvent.startDate,
      endDate: selectedEvent.endDate,
      color: selectedEvent.color,
      location: '',
      isAllDay: selectedEvent.isAllDay
    }

    reminderService.createReminder(calendarEvent, type)
    setShowReminderDialog(false)
    setSelectedEvent(null)
  }

  const getEventReminders = (eventId: string): Reminder[] => {
    return reminderService.getEventReminders(eventId)
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <CustomAlert {...alert} onClose={hideAlert} />
        <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
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
        <CardContent className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 gap-1 mb-4 flex-shrink-0">
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
                        className="text-xs p-1 rounded truncate relative group"
                        style={{ backgroundColor: (event.color || '#3b82f6') + '20', color: event.color || '#3b82f6' }}
                        title={`${event.title || 'Événement'}${formatEventTime(event) ? ` - ${formatEventTime(event)}` : ''}`}
                      >
                        <div className="font-medium">{event.title || 'Événement'}</div>
                        {formatEventTime(event) && (
                          <div className="text-xs opacity-75">{formatEventTime(event)}</div>
                        )}
                        {/* Bouton de suppression qui apparaît au survol */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteEvent(event.id)
                          }}
                          disabled={isDeleting === event.id}
                          className={`absolute top-0 right-0 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[8px] flex items-center justify-center ${
                            isDeleting === event.id 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          title={isDeleting === event.id ? "Suppression en cours..." : "Supprimer cet événement"}
                        >
                          {isDeleting === event.id ? '⋯' : '×'}
                        </button>
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
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={newEvent.isAllDay}
                        onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Toute la journée</span>
                    </label>
                  </div>
                  
                  {!newEvent.isAllDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Heure de début</label>
                        <input
                          type="time"
                          value={newEvent.startTime}
                          onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Heure de fin</label>
                        <input
                          type="time"
                          value={newEvent.endTime}
                          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  )}
                  
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
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newEvent.enableReminders}
                        onChange={(e) => setNewEvent({ ...newEvent, enableReminders: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Créer un rappel automatique (15 min avant)</span>
                    </label>
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
                        {formatEventTime(event) && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatEventTime(event)}
                          </div>
                        )}
                        {event.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {event.description}
                          </div>
                        )}
                        {/* Afficher les rappels existants */}
                        {getEventReminders(event.id).length > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            🔔 {getEventReminders(event.id).length} rappel(s) configuré(s)
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => addReminder(event)}
                          variant="ghost"
                          size="sm"
                          title="Ajouter un rappel"
                        >
                          <BellIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteEvent(event.id)}
                          variant="ghost"
                          size="sm"
                          title="Supprimer cet événement"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
        </Card>

        {/* Dialogue de création de rappel */}
        {showReminderDialog && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-96 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Ajouter un rappel</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Rappel pour : <strong>{selectedEvent.title}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Le {new Date(selectedEvent.startDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="space-y-2 mb-6">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => createReminder('5min')}
                >
                  🔔 5 minutes avant
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => createReminder('15min')}
                >
                  🔔 15 minutes avant
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => createReminder('30min')}
                >
                  🔔 30 minutes avant
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => createReminder('1hour')}
                >
                  🔔 1 heure avant
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => createReminder('1day')}
                >
                  🔔 1 jour avant
                </Button>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReminderDialog(false)
                    setSelectedEvent(null)
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
} 