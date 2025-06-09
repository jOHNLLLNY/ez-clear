"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, User, SettingsIcon, Bell, Globe, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import BottomNavigation from "@/components/bottom-navigation"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/context/user-context"

// Timezone options
const TIMEZONE_OPTIONS = [
  { value: "UTC-12:00", label: "(UTC-12:00) International Date Line West" },
  { value: "UTC-11:00", label: "(UTC-11:00) Coordinated Universal Time-11" },
  { value: "UTC-10:00", label: "(UTC-10:00) Hawaii" },
  { value: "UTC-09:00", label: "(UTC-09:00) Alaska" },
  { value: "UTC-08:00", label: "(UTC-08:00) Pacific Time (US & Canada)" },
  { value: "UTC-07:00", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  { value: "UTC-06:00", label: "(UTC-06:00) Central Time (US & Canada)" },
  { value: "UTC-05:00", label: "(UTC-05:00) Eastern Time (US & Canada)" },
  { value: "UTC-04:00", label: "(UTC-04:00) Atlantic Time (Canada)" },
  { value: "UTC-03:00", label: "(UTC-03:00) Brasilia" },
  { value: "UTC-02:00", label: "(UTC-02:00) Coordinated Universal Time-02" },
  { value: "UTC-01:00", label: "(UTC-01:00) Azores" },
  { value: "UTC+00:00", label: "(UTC+00:00) London, Dublin, Edinburgh" },
  { value: "UTC+01:00", label: "(UTC+01:00) Berlin, Vienna, Rome, Paris" },
  { value: "UTC+02:00", label: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia" },
  { value: "UTC+03:00", label: "(UTC+03:00) Moscow, St. Petersburg, Volgograd" },
  { value: "UTC+04:00", label: "(UTC+04:00) Abu Dhabi, Muscat" },
  { value: "UTC+05:00", label: "(UTC+05:00) Islamabad, Karachi" },
  { value: "UTC+05:30", label: "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi" },
  { value: "UTC+06:00", label: "(UTC+06:00) Astana, Dhaka" },
  { value: "UTC+07:00", label: "(UTC+07:00) Bangkok, Hanoi, Jakarta" },
  { value: "UTC+08:00", label: "(UTC+08:00) Beijing, Hong Kong, Singapore" },
  { value: "UTC+09:00", label: "(UTC+09:00) Tokyo, Seoul, Osaka" },
  { value: "UTC+10:00", label: "(UTC+10:00) Sydney, Melbourne, Brisbane" },
  { value: "UTC+11:00", label: "(UTC+11:00) Vladivostok" },
  { value: "UTC+12:00", label: "(UTC+12:00) Auckland, Wellington" },
]

export default function SettingsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  const { userProfile } = useUser()

  const [activeTab, setActiveTab] = useState("preferences") // Changed default to preferences
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferencesForm, setPreferencesForm] = useState({
    pushNotifications: true,
  })

  const [notificationsForm, setNotificationsForm] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
  })

  const [generalForm, setGeneralForm] = useState({
    timezone: "UTC+00:00",
  })

  // Load user data
  useEffect(() => {
    if (userProfile) {
      // Load preferences from localStorage or user settings
      setPreferencesForm({
        pushNotifications: localStorage.getItem("pushNotifications") === "true",
      })

      // Load user settings from API
      fetchUserSettings()
    }
  }, [userProfile])

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/settings")
      if (response.ok) {
        const data = await response.json()

        // Update notifications form
        setNotificationsForm({
          emailNotifications: data.notifications?.email || true,
          smsNotifications: data.notifications?.sms || false,
          appNotifications: data.notifications?.app || true,
        })

        // Update general form
        setGeneralForm({
          timezone: data.timezone || "UTC+00:00",
        })
      }
    } catch (error) {
      console.error("Failed to fetch user settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePushNotificationsChange = (checked: boolean) => {
    setPreferencesForm((prev) => ({ ...prev, pushNotifications: checked }))
    localStorage.setItem("pushNotifications", String(checked))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationsForm((prev) => ({ ...prev, [name]: checked }))
  }

  const handleGeneralFormChange = (name: string, value: string) => {
    setGeneralForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwordsDoNotMatch"),
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: t("error"),
        description: t("passwordTooShort"),
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: t("passwordChanged"),
          description: t("passwordChangeSuccess"),
        })
        // Reset form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast({
          title: t("error"),
          description: data.error || t("passwordChangeError"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: t("error"),
        description: t("passwordChangeError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pushNotifications: preferencesForm.pushNotifications,
        }),
      })

      if (response.ok) {
        toast({
          title: t("preferencesUpdated"),
          description: t("preferencesUpdateSuccess"),
        })
      } else {
        const error = await response.json()
        toast({
          title: t("error"),
          description: error.message || t("preferencesUpdateError"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("preferencesUpdateError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: notificationsForm.emailNotifications,
          sms: notificationsForm.smsNotifications,
          app: notificationsForm.appNotifications,
        }),
      })

      if (response.ok) {
        toast({
          title: t("notificationsUpdated"),
          description: t("notificationsUpdateSuccess"),
        })
      } else {
        const error = await response.json()
        toast({
          title: t("error"),
          description: error.message || t("notificationsUpdateError"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("notificationsUpdateError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timezone: generalForm.timezone,
        }),
      })

      if (response.ok) {
        toast({
          title: t("generalSettingsUpdated"),
          description: t("generalSettingsUpdateSuccess"),
        })
      } else {
        const error = await response.json()
        toast({
          title: t("error"),
          description: error.message || t("generalSettingsUpdateError"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("generalSettingsUpdateError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user", {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: t("accountDeleted"),
          description: t("accountDeleteSuccess"),
        })

        // Log out and redirect to home page
        router.push("/")
      } else {
        const error = await response.json()
        toast({
          title: t("error"),
          description: error.message || t("accountDeleteError"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("accountDeleteError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 flex items-center bg-white dark:bg-gray-800 shadow-soft z-10">
        <Link
          href="/profile"
          className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 dark:text-gray-200" />
        </Link>
        <h1 className="text-xl font-semibold dark:text-white">{t("settings")}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 dark:bg-gray-800">
            <TabsTrigger
              value="account"
              className="flex flex-col items-center py-2 dark:data-[state=active]:bg-gray-700"
            >
              <User className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("account")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex flex-col items-center py-2 dark:data-[state=active]:bg-gray-700"
            >
              <SettingsIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("preferences")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex flex-col items-center py-2 dark:data-[state=active]:bg-gray-700"
            >
              <Bell className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("notifications")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="flex flex-col items-center py-2 dark:data-[state=active]:bg-gray-700"
            >
              <Globe className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("general")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            {/* Change Password */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">{t("changePassword")}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="dark:text-gray-200">
                      {t("currentPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordFormChange}
                        className="mt-1 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="dark:text-gray-200">
                      {t("newPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        className="mt-1 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="dark:text-gray-200">
                      {t("confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordFormChange}
                        className="mt-1 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      isLoading ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("updating")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("updatePassword")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-4">
              <Link
                href="/profile/edit"
                className="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                {t("editProfile")}
              </Link>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">{t("appPreferences")}</h2>

                {/* Language Selector */}
                <div className="space-y-4">
                  <div>
                    <Label className="block mb-2 dark:text-gray-200">{t("language")}</Label>
                    <LanguageSelector />
                  </div>

                  <Separator className="my-4 dark:bg-gray-700" />

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white">{t("pushNotifications")}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("enablePushNotifications")}</p>
                    </div>
                    <Switch
                      checked={preferencesForm.pushNotifications}
                      onCheckedChange={handlePushNotificationsChange}
                    />
                  </div>

                  <Button onClick={handleSavePreferences} disabled={isLoading} className="w-full mt-4">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("saveChanges")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">{t("notificationPreferences")}</h2>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white">{t("emailNotifications")}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("receiveJobAlerts")}</p>
                    </div>
                    <Switch
                      checked={notificationsForm.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>

                  <Separator className="my-4 dark:bg-gray-700" />

                  {/* SMS Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white">{t("smsNotifications")}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("receiveTextMessages")}</p>
                    </div>
                    <Switch
                      checked={notificationsForm.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                    />
                  </div>

                  <Separator className="my-4 dark:bg-gray-700" />

                  {/* App Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white">{t("appNotifications")}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("receiveAlertsOnDevice")}</p>
                    </div>
                    <Switch
                      checked={notificationsForm.appNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("appNotifications", checked)}
                    />
                  </div>

                  <Button onClick={handleSaveNotifications} disabled={isLoading} className="w-full mt-4">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("saveChanges")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">{t("generalSettings")}</h2>

                <div className="space-y-4">
                  {/* Timezone Selection */}
                  <div>
                    <Label htmlFor="timezone" className="dark:text-gray-200">
                      {t("timezone")}
                    </Label>
                    <Select
                      value={generalForm.timezone}
                      onValueChange={(value) => handleGeneralFormChange("timezone", value)}
                    >
                      <SelectTrigger
                        id="timezone"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <SelectValue placeholder={t("selectTimezone")} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {TIMEZONE_OPTIONS.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value} className="dark:text-gray-200">
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("timezoneDescription")}</p>
                  </div>

                  <Button onClick={handleSaveGeneral} disabled={isLoading} className="w-full mt-4">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("saveChanges")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
