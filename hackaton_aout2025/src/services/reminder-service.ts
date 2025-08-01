import { useNotificationStore } from "@/stores/notification-store"
import { calendarService, type CalendarEvent } from "./calendar-service"

export interface Reminder {
  id: string
  eventId: string
  eventTitle: string
  eventDate: Date
  reminderTime: Date
  type: '5min' | '15min' | '30min' | '1hour' | '1day'
  sent: boolean
}

class ReminderService {
  private reminders: Reminder[] = []
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    this.loadReminders()
    this.startReminderCheck()
  }

  // Charger les rappels depuis le localStorage
  private loadReminders() {
    const saved = localStorage.getItem('calendar-reminders')
    if (saved) {
      this.reminders = JSON.parse(saved).map((r: any) => ({
        ...r,
        eventDate: new Date(r.eventDate),
        reminderTime: new Date(r.reminderTime)
      }))
    }
  }

  // Sauvegarder les rappels dans le localStorage
  private saveReminders() {
    localStorage.setItem('calendar-reminders', JSON.stringify(this.reminders))
  }

  // Créer un rappel pour un événement
  createReminder(event: CalendarEvent, type: Reminder['type']): Reminder {
    const eventDate = new Date(event.startDate)
    let reminderTime: Date

    switch (type) {
      case '5min':
        reminderTime = new Date(eventDate.getTime() - 5 * 60 * 1000)
        break
      case '15min':
        reminderTime = new Date(eventDate.getTime() - 15 * 60 * 1000)
        break
      case '30min':
        reminderTime = new Date(eventDate.getTime() - 30 * 60 * 1000)
        break
      case '1hour':
        reminderTime = new Date(eventDate.getTime() - 60 * 60 * 1000)
        break
      case '1day':
        reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
        break
      default:
        reminderTime = new Date(eventDate.getTime() - 15 * 60 * 1000)
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      eventId: event.id.toString(),
      eventTitle: event.title,
      eventDate: eventDate,
      reminderTime: reminderTime,
      type,
      sent: false
    }

    this.reminders.push(reminder)
    this.saveReminders()
    return reminder
  }

  // Créer des rappels automatiques pour un événement
  createAutoReminders(event: CalendarEvent): Reminder[] {
    const reminders: Reminder[] = []
    
    // Rappel 15 minutes avant
    reminders.push(this.createReminder(event, '15min'))
    
    // Si l'événement est dans plus d'une heure, ajouter un rappel 1 heure avant
    const eventDate = new Date(event.startDate)
    const now = new Date()
    if (eventDate.getTime() - now.getTime() > 60 * 60 * 1000) {
      reminders.push(this.createReminder(event, '1hour'))
    }

    return reminders
  }

  // Supprimer un rappel
  deleteReminder(reminderId: string) {
    this.reminders = this.reminders.filter(r => r.id !== reminderId)
    this.saveReminders()
  }

  // Supprimer tous les rappels d'un événement
  deleteEventReminders(eventId: string) {
    this.reminders = this.reminders.filter(r => r.eventId !== eventId)
    this.saveReminders()
  }

  // Obtenir tous les rappels
  getReminders(): Reminder[] {
    return this.reminders
  }

  // Obtenir les rappels d'un événement
  getEventReminders(eventId: string): Reminder[] {
    return this.reminders.filter(r => r.eventId === eventId)
  }

  // Vérifier les rappels à envoyer
  private checkReminders() {
    const now = new Date()
    const notifications = useNotificationStore.getState()

    this.reminders.forEach(reminder => {
      if (!reminder.sent && reminder.reminderTime <= now) {
        // Envoyer la notification
        notifications.addNotification({
          title: `Rappel: ${reminder.eventTitle}`,
          message: `L'événement commence dans ${this.getTimeUntilEvent(reminder.eventDate)}`,
          type: 'info',
          category: 'calendar'
        })

        // Marquer comme envoyé
        reminder.sent = true
      }
    })

    this.saveReminders()
  }

  // Obtenir le temps restant jusqu'à l'événement
  private getTimeUntilEvent(eventDate: Date): string {
    const now = new Date()
    const diff = eventDate.getTime() - now.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'moins d\'une minute'
    if (minutes < 60) return `${minutes} minutes`
    if (hours < 24) return `${hours} heure${hours > 1 ? 's' : ''}`
    return `${Math.floor(hours / 24)} jour${Math.floor(hours / 24) > 1 ? 's' : ''}`
  }

  // Démarrer la vérification des rappels
  private startReminderCheck() {
    // Vérifier toutes les minutes
    this.checkInterval = setInterval(() => {
      this.checkReminders()
    }, 60000) // 60 secondes

    // Vérifier immédiatement au démarrage
    this.checkReminders()
  }

  // Arrêter la vérification des rappels
  stopReminderCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  // Nettoyer les anciens rappels
  cleanupOldReminders() {
    const now = new Date()
    this.reminders = this.reminders.filter(r => {
      // Garder les rappels non envoyés et les rappels envoyés depuis moins de 24h
      return !r.sent || (r.sent && now.getTime() - r.reminderTime.getTime() < 24 * 60 * 60 * 1000)
    })
    this.saveReminders()
  }
}

// Instance singleton
export const reminderService = new ReminderService()

// Nettoyer les anciens rappels au démarrage
reminderService.cleanupOldReminders() 