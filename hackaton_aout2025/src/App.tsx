import { Desktop } from "@/components/desktop/desktop"
import { TaskBar } from "@/components/taskbar/taskbar"
import { WindowManager } from "@/components/window-manager/window-manager"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { NotificationToaster } from "@/components/ui/notification-toast"

export default function App() {
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
