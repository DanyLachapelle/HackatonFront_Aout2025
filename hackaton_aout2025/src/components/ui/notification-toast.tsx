import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react"
import { useNotificationStore, type Notification } from "@/stores/notification-store"

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function NotificationToast({ notification, onClose, position }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  return (
    <div
      className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-full">
        <div className="flex items-start space-x-3">
          {getIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationToaster() {
  const { notifications, settings, deleteNotification } = useNotificationStore()
  const [toasts, setToasts] = useState<Notification[]>([])

  useEffect(() => {
    // Filtrer les notifications non lues pour les afficher comme toasts
    const unreadNotifications = notifications.filter(n => !n.read)
    setToasts(unreadNotifications)
  }, [notifications])

  const handleClose = (id: string) => {
    deleteNotification(id)
  }

  if (!settings.enabled || toasts.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => handleClose(notification.id)}
          position={settings.position}
        />
      ))}
    </div>
  )
} 