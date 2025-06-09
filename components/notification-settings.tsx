"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useNotifications } from "@/context/notification-context"
import { Volume2, VolumeX } from "lucide-react"
import { soundUtils } from "@/utils/sound-utils"

export function NotificationSettings() {
  const { soundEnabled, toggleSound } = useNotifications()
  const [testingSound, setTestingSound] = useState(false)

  const handleTestSound = () => {
    setTestingSound(true)
    soundUtils.testSound()
    setTimeout(() => setTestingSound(false), 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {soundEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
          <span>Notification Sounds</span>
        </div>
        <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {soundEnabled ? "Sound alerts are enabled for new notifications" : "Sound alerts are disabled"}
        </span>
        <Button variant="outline" size="sm" onClick={handleTestSound} disabled={!soundEnabled || testingSound}>
          {testingSound ? "Playing..." : "Test Sound"}
        </Button>
      </div>
    </div>
  )
}
