import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { 
  PaletteIcon, 
  MonitorIcon, 
  BellIcon, 
  GlobeIcon,
  ShieldIcon,
  InfoIcon,
  MoonIcon,
  SunIcon,
  MonitorSmartphoneIcon,
  SettingsIcon
} from "lucide-react"
import { useDesktopStore } from "@/stores/desktop-store"
import { useNotificationStore } from "@/stores/notification-store"

export function Settings() {
  const { wallpaper, setWallpaper } = useDesktopStore()
  const { 
    settings: notificationSettings, 
    updateSettings: updateNotificationSettings, 
    clearAllNotifications,
    addNotification 
  } = useNotificationStore()
  
  const [settings, setSettings] = useState({
    theme: "system",
    language: "fr",
    sound: true,
    autoSave: true,
    animations: true,
    transparency: 0.8,
    fontSize: 14,
    accentColor: "#3b82f6",
    timeFormat: "24h",
    dateFormat: "dd/mm/yyyy"
  })

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const themes = [
    { value: "light", label: "Clair", icon: SunIcon },
    { value: "dark", label: "Sombre", icon: MoonIcon },
    { value: "system", label: "Système", icon: MonitorIcon }
  ]

  const languages = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "de", label: "Deutsch" }
  ]

  const accentColors = [
    { value: "#3b82f6", label: "Bleu", color: "#3b82f6" },
    { value: "#ef4444", label: "Rouge", color: "#ef4444" },
    { value: "#10b981", label: "Vert", color: "#10b981" },
    { value: "#f59e0b", label: "Orange", color: "#f59e0b" },
    { value: "#8b5cf6", label: "Violet", color: "#8b5cf6" },
    { value: "#ec4899", label: "Rose", color: "#ec4899" }
  ]

  const timeFormats = [
    { value: "12h", label: "12 heures (AM/PM)" },
    { value: "24h", label: "24 heures" }
  ]

  const dateFormats = [
    { value: "dd/mm/yyyy", label: "DD/MM/YYYY" },
    { value: "mm/dd/yyyy", label: "MM/DD/YYYY" },
    { value: "yyyy-mm-dd", label: "YYYY-MM-DD" }
  ]

  const notificationPositions = [
    { value: "top-left", label: "Haut gauche" },
    { value: "top-right", label: "Haut droite" },
    { value: "bottom-left", label: "Bas gauche" },
    { value: "bottom-right", label: "Bas droite" }
  ]

  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Paramètres
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <Tabs defaultValue="appearance" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <PaletteIcon className="w-4 h-4" />
                Apparence
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <MonitorIcon className="w-4 h-4" />
                Système
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <BellIcon className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <InfoIcon className="w-4 h-4" />
                À propos
              </TabsTrigger>
            </TabsList>

            {/* Apparence */}
            <TabsContent value="appearance" className="h-full">
              <div className="space-y-6 p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Thème</h3>
                  
                  <div className="space-y-3">
                    <Label>Mode d'affichage</Label>
                    <Select value={settings.theme} onValueChange={(value: string) => updateSetting("theme", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map(theme => (
                          <SelectItem key={theme.value} value={theme.value}>
                            <div className="flex items-center gap-2">
                              <theme.icon className="w-4 h-4" />
                              {theme.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Couleur d'accent</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {accentColors.map(color => (
                        <button
                          key={color.value}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            settings.accentColor === color.value 
                              ? 'border-gray-800 scale-110' 
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.color }}
                          onClick={() => updateSetting("accentColor", color.value)}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Transparence des fenêtres</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[settings.transparency * 100]}
                        onValueChange={([value]: number[]) => updateSetting("transparency", value / 100)}
                        max={100}
                        min={20}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(settings.transparency * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Taille de police</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[settings.fontSize]}
                        onValueChange={([value]: number[]) => updateSetting("fontSize", value)}
                        max={20}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {settings.fontSize}px
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Animations</Label>
                    <Switch
                      checked={settings.animations}
                      onCheckedChange={(checked: boolean) => updateSetting("animations", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Système */}
            <TabsContent value="system" className="h-full">
              <div className="space-y-6 p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuration système</h3>
                  
                  <div className="space-y-3">
                    <Label>Langue</Label>
                    <Select value={settings.language} onValueChange={(value: string) => updateSetting("language", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Format d'heure</Label>
                    <Select value={settings.timeFormat} onValueChange={(value: string) => updateSetting("timeFormat", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeFormats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Format de date</Label>
                    <Select value={settings.dateFormat} onValueChange={(value: string) => updateSetting("dateFormat", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Sauvegarde automatique</Label>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked: boolean) => updateSetting("autoSave", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Sons système</Label>
                    <Switch
                      checked={settings.sound}
                      onCheckedChange={(checked: boolean) => updateSetting("sound", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fond d'écran</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-2">Actuel</div>
                      <div 
                        className="w-full h-20 rounded border"
                        style={{
                          background: wallpaper.type === "gradient" 
                            ? `linear-gradient(${wallpaper.direction || "135deg"}, ${wallpaper.colors?.join(", ") || "#8b5cf6, #7c3aed"})`
                            : wallpaper.type === "solid"
                            ? wallpaper.color
                            : "#8b5cf6"
                        }}
                      />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-2">Personnaliser</div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Ici on pourrait ouvrir le sélecteur de fond d'écran
                          console.log("Ouvrir sélecteur de fond d'écran")
                        }}
                      >
                        Changer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="h-full">
              <div className="space-y-6 p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Activer les notifications</Label>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Recevoir des notifications système
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.enabled}
                      onCheckedChange={(checked: boolean) => updateNotificationSettings({ enabled: checked })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Types de notifications</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notifications système</span>
                        <Switch 
                          checked={notificationSettings.systemNotifications} 
                          onCheckedChange={(checked: boolean) => updateNotificationSettings({ systemNotifications: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Nouveaux messages</span>
                        <Switch 
                          checked={notificationSettings.messageNotifications} 
                          onCheckedChange={(checked: boolean) => updateNotificationSettings({ messageNotifications: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mises à jour système</span>
                        <Switch 
                          checked={notificationSettings.updateNotifications} 
                          onCheckedChange={(checked: boolean) => updateNotificationSettings({ updateNotifications: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rappels de calendrier</span>
                        <Switch 
                          checked={notificationSettings.calendarNotifications} 
                          onCheckedChange={(checked: boolean) => updateNotificationSettings({ calendarNotifications: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minuteur terminé</span>
                        <Switch 
                          checked={notificationSettings.timerNotifications} 
                          onCheckedChange={(checked: boolean) => updateNotificationSettings({ timerNotifications: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Position des notifications</Label>
                    <Select 
                      value={notificationSettings.position} 
                      onValueChange={(value: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => 
                        updateNotificationSettings({ position: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationPositions.map(pos => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Sons de notification</Label>
                    <Switch
                      checked={notificationSettings.sound}
                      onCheckedChange={(checked: boolean) => updateNotificationSettings({ sound: checked })}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={clearAllNotifications}
                      className="w-full"
                    >
                      Effacer toutes les notifications
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => addNotification({
                        title: "Test de notification",
                        message: "Ceci est un test de notification.",
                        type: "info",
                        category: "system"
                      })}
                      className="w-full"
                    >
                      Ajouter une notification de test
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* À propos */}
            <TabsContent value="about" className="h-full">
              <div className="space-y-6 p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">À propos du système</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-2">Version</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">1.0.0</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-2">Développeur</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Équipe AEMT - Groupe 7</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-2">Technologies</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        React + Vite, TypeScript, Tailwind CSS
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-2">Licence</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">MIT License</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Applications disponibles</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>✅ Calculatrice</div>
                      <div>✅ Horloge</div>
                      <div>✅ Calendrier</div>
                      <div>✅ Paramètres</div>
                      <div>✅ Éditeur de texte</div>
                      <div>✅ Explorateur de fichiers</div>
                      <div>✅ Terminal</div>
                      <div>✅ Galerie d'images</div>
                      <div>✅ Lecteur de musique</div>
                      <div>✅ Paint</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Vérifier les mises à jour
                    </Button>
                    <Button variant="outline" size="sm">
                      Rapport de bug
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 