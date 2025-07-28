import { Clock } from "./clock"
import { StartButton } from "./start-button"
import { WindowButtons } from "./window-buttons"
import { NotificationArea } from "./notification-area"
import { SearchBar } from "./search-bar"
import { QuickActions } from "./quick-actions"
import { SystemTray } from "./system-tray"

export function TaskBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-600/50 flex items-center px-2 z-50 shadow-lg">
      <StartButton />

      <div className="mx-2">
        <SearchBar />
      </div>

      <QuickActions />

      <div className="flex-1 px-2">
        <WindowButtons />
      </div>

      <SystemTray />

      <div className="flex items-center space-x-2">
        <NotificationArea />
        <Clock />
      </div>
    </div>
  )
} 