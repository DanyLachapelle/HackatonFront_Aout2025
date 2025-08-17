import { Desktop } from "@/components/desktop/desktop"
import { TaskBar } from "@/components/taskbar/taskbar"
import { WindowManager } from "@/components/window-manager/window-manager"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { NotificationToaster } from "@/components/ui/notification-toast"
import { useEffect } from "react"
import { useWindowStore } from "@/stores/window-store"

export default function App() {
  const { closeWindow, activeWindowId } = useWindowStore()

  // Gestionnaire d'événements clavier global
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Backspace global pour fermer la fenêtre active
      if (event.key === 'Backspace' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Vérifier si on est dans un champ de saisie
        const activeElement = document.activeElement
        const isInputField = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' || 
                           (activeElement as HTMLElement)?.contentEditable === 'true'
        
        // Si on n'est pas dans un champ de saisie et qu'il y a une fenêtre active, la fermer
        if (!isInputField && activeWindowId) {
          event.preventDefault()
          closeWindow(activeWindowId)
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [closeWindow, activeWindowId])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-gray-800 dark:via-gray-900 dark:to-black">
        <Desktop />
        <WindowManager />
        <TaskBar />
        <Toaster />
        <NotificationToaster />
      </div>
    </ThemeProvider>
  )
}


