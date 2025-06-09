class SoundUtils {
  private static instance: SoundUtils

  private constructor() {}

  public static getInstance(): SoundUtils {
    if (!SoundUtils.instance) {
      SoundUtils.instance = new SoundUtils()
    }
    return SoundUtils.instance
  }

  public isSoundEnabled(): boolean {
    if (typeof window === "undefined") return true
    return localStorage.getItem("notificationSoundEnabled") !== "false"
  }

  public setSoundEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return
    localStorage.setItem("notificationSoundEnabled", enabled ? "true" : "false")
  }

  public playNotificationSound(): void {
    if (typeof window === "undefined") return
    try {
      const audio = new Audio("/sounds/notification.mp3")
      audio.volume = 0.5
      audio.play().catch((err) => {
        console.error("Error playing notification sound:", err)
      })
    } catch (err) {
      console.error("Error creating audio element:", err)
    }
  }
}

export const soundUtils = SoundUtils.getInstance()
