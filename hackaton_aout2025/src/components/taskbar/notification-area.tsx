import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, X, Settings, CheckCircle, AlertCircle, Info, Clock } from "lucide-react"
import { useNotificationStore } from "@/stores/notification-store"
import { reminderService, type Reminder } from "@/services/reminder-service"

export function NotificationArea() {
  const [showPanel, setShowPanel] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [activeTab, setActiveTab] = useState<'notifications' | 'reminders'>('notifications')
  
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    getUnreadCount,
    addNotification
  } = useNotificationStore()

  const unreadCount = getUnreadCount()

  // Charger les rappels
  useEffect(() => {
    const loadReminders = () => {
      const allReminders = reminderService.getReminders()
      setReminders(allReminders)
    }

    loadReminders()
    
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadReminders, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Vérifier les rappels à venir
  useEffect(() => {
    const checkUpcomingReminders = () => {
      const now = new Date()
      const upcomingReminders = reminders.filter(r => {
        const timeUntilReminder = r.reminderTime.getTime() - now.getTime()
        // Rappels dans les 5 prochaines minutes
        return timeUntilReminder > 0 && timeUntilReminder <= 5 * 60 * 1000 && !r.sent
      })

      upcomingReminders.forEach(reminder => {
        addNotification({
          title: `Rappel à venir: ${reminder.eventTitle}`,
          message: `L'événement commence dans ${getTimeUntilEvent(reminder.eventDate)}`,
          type: 'info',
          category: 'calendar'
        })
      })
    }

    const interval = setInterval(checkUpcomingReminders, 60000) // Vérifier toutes les minutes
    return () => clearInterval(interval)
  }, [reminders, addNotification])

  const getTimeUntilEvent = (eventDate: Date): string => {
    const now = new Date()
    const diff = eventDate.getTime() - now.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'moins d\'une minute'
    if (minutes < 60) return `${minutes} minutes`
    if (hours < 24) return `${hours} heure${hours > 1 ? 's' : ''}`
    return `${Math.floor(hours / 24)} jour${Math.floor(hours / 24) > 1 ? 's' : ''}`
  }

  const formatReminderTime = (date: Date): string => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const deleteReminder = (reminderId: string) => {
    reminderService.deleteReminder(reminderId)
    setReminders(reminderService.getReminders())
  }

  const markReminderAsSent = (reminderId: string) => {
    const updatedReminders = reminders.map(r => 
      r.id === reminderId ? { ...r, sent: true } : r
    )
    setReminders(updatedReminders)
  }

  const activeReminders = reminders.filter(r => !r.sent)
  const sentReminders = reminders.filter(r => r.sent)
  const totalUnread = unreadCount + activeReminders.length

  const getNotificationIcon = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="text-white hover:bg-white/10 h-8 w-8 p-0 relative"
        onClick={() => setShowPanel(!showPanel)}
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </Button>

      {/* Panneau de notifications et rappels */}
      {showPanel && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-96 max-h-96 overflow-hidden z-50">
          {/* En-tête avec onglets */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Notifications ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'reminders'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Rappels ({activeReminders.length})
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {activeTab === 'notifications' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Tout marquer comme lu
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Ici on pourrait ouvrir les paramètres de notifications
                  console.log("Ouvrir paramètres de notifications")
                }}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="max-h-64 overflow-y-auto">
            {activeTab === 'notifications' ? (
              // Onglet Notifications
              <div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Onglet Rappels
              <div>
                {activeReminders.length === 0 && sentReminders.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Aucun rappel configuré
                  </div>
                ) : (
                  <div>
                    {/* Rappels actifs */}
                    {activeReminders.length > 0 && (
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Rappels actifs ({activeReminders.length})
                        </h4>
                        <div className="space-y-2">
                          {activeReminders.map(reminder => (
                            <div
                              key={reminder.id}
                              className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {reminder.eventTitle}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {formatReminderTime(reminder.reminderTime)}
                                  </div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    Événement le {formatReminderTime(reminder.eventDate)}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markReminderAsSent(reminder.id)}
                                    className="h-6 w-6 p-0"
                                    title="Marquer comme envoyé"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteReminder(reminder.id)}
                                    className="h-6 w-6 p-0 text-red-500"
                                    title="Supprimer le rappel"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rappels envoyés */}
                    {sentReminders.length > 0 && (
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Rappels envoyés ({sentReminders.length})
                        </h4>
                        <div className="space-y-2">
                          {sentReminders.slice(0, 3).map(reminder => (
                            <div
                              key={reminder.id}
                              className="p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {reminder.eventTitle}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Envoyé le {formatReminderTime(reminder.reminderTime)}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteReminder(reminder.id)}
                                  className="h-6 w-6 p-0 text-gray-400"
                                  title="Supprimer le rappel"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
            >
              Voir toutes les notifications
            </Button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {showPanel && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  )
} 