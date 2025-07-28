import { Button } from "@/components/ui/button"
import { useWindowStore } from "@/stores/window-store"
import { FolderIcon, CalculatorIcon, TerminalIcon, SettingsIcon } from "lucide-react"

export function QuickActions() {
  const { openWindow } = useWindowStore()

  const quickApps = [
    {
      icon: FolderIcon,
      title: "Explorateur",
      type: "file-explorer",
      size: { width: 800, height: 600 },
    },
    {
      icon: CalculatorIcon,
      title: "Calculatrice",
      type: "calculator",
      size: { width: 320, height: 480 },
    },
    {
      icon: TerminalIcon,
      title: "Terminal",
      type: "terminal",
      size: { width: 700, height: 500 },
    },
    {
      icon: SettingsIcon,
      title: "Paramètres",
      type: "settings",
      size: { width: 700, height: 500 },
    },
  ]

  const handleQuickLaunch = (app: (typeof quickApps)[0]) => {
    openWindow({
      id: `${app.type}-${Date.now()}`,
      title: app.title,
      type: app.type as any,
      position: { x: 100, y: 100 },
      size: app.size,
      initialPath: app.type === "file-explorer" ? "/" : undefined,
    })
  }

  return (
    <div className="flex items-center space-x-1">
      {quickApps.map((app, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          onClick={() => handleQuickLaunch(app)}
          title={app.title}
        >
          <app.icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  )
} 