import React from 'react'
import { AlertCircle, X, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface CustomAlertProps {
  type: AlertType
  title: string
  message: string
  onClose: () => void
  show: boolean
}

const alertStyles = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: Info,
    iconColor: 'text-blue-500'
  }
}

export function CustomAlert({ type, title, message, onClose, show }: CustomAlertProps) {
  if (!show) return null

  const style = alertStyles[type]
  const IconComponent = style.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg border ${style.bg} ${style.border} shadow-xl`}>
        <div className="flex items-start space-x-3">
          <IconComponent className={`w-6 h-6 mt-0.5 ${style.iconColor}`} />
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${style.text}`}>
              {title}
            </h3>
            <p className={`mt-2 text-sm ${style.text} opacity-90`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-black/10 ${style.text} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'error' 
                ? 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-200'
                : type === 'warning'
                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-200'
                : type === 'success'
                ? 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-200'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-200'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook pour utiliser l'alerte personnalisée
export function useCustomAlert() {
  const [alert, setAlert] = React.useState<{
    show: boolean
    type: AlertType
    title: string
    message: string
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showAlert = (type: AlertType, title: string, message: string) => {
    setAlert({ show: true, type, title, message })
  }

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }))
  }

  const showError = (title: string, message: string) => showAlert('error', title, message)
  const showSuccess = (title: string, message: string) => showAlert('success', title, message)
  const showWarning = (title: string, message: string) => showAlert('warning', title, message)
  const showInfo = (title: string, message: string) => showAlert('info', title, message)

  return {
    alert,
    showAlert,
    hideAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}
