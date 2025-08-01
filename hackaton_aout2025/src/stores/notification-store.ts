import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  category?: 'system' | 'messages' | 'updates' | 'calendar' | 'timer'
}

interface NotificationSettings {
  enabled: boolean
  systemNotifications: boolean
  messageNotifications: boolean
  updateNotifications: boolean
  calendarNotifications: boolean
  timerNotifications: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  sound: boolean
}

interface NotificationStore {
  notifications: Notification[]
  settings: NotificationSettings
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void
  updateSettings: (settings: Partial<NotificationSettings>) => void
  getUnreadCount: () => number
  getNotificationsByCategory: (category: Notification['category']) => Notification[]
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          title: 'Système',
          message: 'Toutes les applications sont à jour',
          type: 'success',
          timestamp: new Date(Date.now() - 300000),
          read: false,
          category: 'system'
        },
        {
          id: '2',
          title: 'Explorateur de fichiers',
          message: 'Nouveau fichier créé avec succès',
          type: 'info',
          timestamp: new Date(Date.now() - 600000),
          read: false,
          category: 'system'
        },
        {
          id: '3',
          title: 'Sécurité',
          message: 'Vérification antivirus terminée',
          type: 'success',
          timestamp: new Date(Date.now() - 900000),
          read: true,
          category: 'system'
        }
      ],
      settings: {
        enabled: true,
        systemNotifications: true,
        messageNotifications: true,
        updateNotifications: true,
        calendarNotifications: true,
        timerNotifications: true,
        position: 'bottom-right' as const,
        sound: true
      },

      addNotification: (notification) => {
        const settings = get().settings
        const category = notification.category

        // Vérifier si les notifications pour cette catégorie sont activées
        if (!settings.enabled) return
        if (category === 'system' && !settings.systemNotifications) return
        if (category === 'messages' && !settings.messageNotifications) return
        if (category === 'updates' && !settings.updateNotifications) return
        if (category === 'calendar' && !settings.calendarNotifications) return
        if (category === 'timer' && !settings.timerNotifications) return

        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50) // Limiter à 50 notifications
        }))

        // Jouer un son si activé
        if (settings.sound) {
          // Ici on pourrait jouer un son de notification
          console.log('🔔 Notification sonore')
        }
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }))
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length
      },

      getNotificationsByCategory: (category) => {
        return get().notifications.filter(n => n.category === category)
      }
    }),
    {
      name: "notification-store",
    }
  )
) 