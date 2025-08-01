import { config } from "@/config/environment"

// Types pour les événements du calendrier
export interface CalendarEvent {
  id: number
  title: string
  description?: string
  startDate: string
  endDate?: string
  color: string
  isAllDay: boolean
  location?: string
  userId: number
  createdAt: string
  updatedAt: string
}

export interface CreateEventRequest {
  title: string
  description?: string
  startDate: string
  endDate?: string
  color?: string
  isAllDay?: boolean
  location?: string
  userId: number
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  color?: string
  isAllDay?: boolean
  location?: string
}

export interface EventReminder {
  id: number
  eventId: number
  reminderTime: string
  reminderType: '5min' | '15min' | '30min' | '1hour' | '1day'
  isSent: boolean
  createdAt: string
  eventTitle: string
  eventStartDate: string
}

class CalendarService {
  private baseUrl = `${config.apiUrl}/calendar`
  private userId = config.defaultUserId

  // === GESTION DES ÉVÉNEMENTS ===

  async getEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/events?userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des événements')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      return []
    }
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events/range?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&userId=${this.userId}`
      )
      if (!response.ok) throw new Error('Erreur lors du chargement des événements')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      return []
    }
  }

  async createEvent(eventData: CreateEventRequest): Promise<CalendarEvent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })
      if (!response.ok) throw new Error('Erreur lors de la création de l\'événement')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return null
    }
  }

  async updateEvent(eventId: number, eventData: UpdateEventRequest): Promise<CalendarEvent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })
      if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'événement')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return null
    }
  }

  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      return false
    }
  }

  async getEventById(eventId: number): Promise<CalendarEvent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`)
      if (!response.ok) throw new Error('Événement non trouvé')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error)
      return null
    }
  }

  // === MÉTHODES UTILITAIRES ===

  formatDateForAPI(date: Date): string {
    return date.toISOString()
  }

  parseDateFromAPI(dateString: string): Date {
    return new Date(dateString)
  }

  getDefaultEventColor(): string {
    return '#3b82f6' // Bleu par défaut
  }

  // === GESTION DES RAPPELS ===

  async createReminder(eventId: number, reminderType: string): Promise<EventReminder | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/reminders?reminderType=${reminderType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) throw new Error('Erreur lors de la création du rappel')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la création du rappel:', error)
      return null
    }
  }

  async getEventReminders(eventId: number): Promise<EventReminder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/reminders`)
      if (!response.ok) throw new Error('Erreur lors du chargement des rappels')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error)
      return []
    }
  }

  async getPendingReminders(): Promise<EventReminder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reminders/pending?userId=${this.userId}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des rappels')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error)
      return []
    }
  }

  async getRemindersToSend(): Promise<EventReminder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reminders/to-send`)
      if (!response.ok) throw new Error('Erreur lors du chargement des rappels')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error)
      return []
    }
  }

  async markReminderAsSent(reminderId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/reminders/${reminderId}/mark-sent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      return response.ok
    } catch (error) {
      console.error('Erreur lors du marquage du rappel:', error)
      return false
    }
  }

  async deleteReminder(reminderId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/reminders/${reminderId}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Erreur lors de la suppression du rappel:', error)
      return false
    }
  }
}

export const calendarService = new CalendarService() 