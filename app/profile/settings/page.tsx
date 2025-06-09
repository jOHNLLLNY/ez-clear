"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Bell,
  MapPin,
  DollarSign,
  Clock,
  User,
  Calendar,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  SettingsIcon,
  Globe,
  Moon,
  Sun,
  Laptop,
  Shield,
} from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { NotificationSettings } from "@/components/notification-settings"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/context/language-context"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [userType, setUserType] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("account")
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    notification: false,
    location: false,
    availability: false,
    vacation: false,
    payment: false,
    privacy: false,
    danger: false,
    language: false,
    theme: false,
  })
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [vacationMode, setVacationMode] = useState(false)
  const [vacationDates, setVacationDates] = useState({
    start: null,
    end: null,
  })
  const [theme, setTheme] = useState("light")

  const [settings, setSettings] = useState({
    // Profile settings
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Experienced in snow removal and landscaping with 5+ years of service.",

    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,

    // Location settings
    serviceRadius: "10",
    city: "Anytown",
    province: "ON",

    // Availability settings (for workers)
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    startTime: "08:00",
    endTime: "17:00",

    // Payment settings (for workers)
    minimumRate: "50",
    preferredPayment: "direct_deposit",
    paymentDetails: "",

    // Privacy settings
    showPhone: false,
    showEmail: true,
  })

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Get theme from localStorage
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleDayToggle = (day) => {
    setSettings((prev) => {
      const availableDays = [...prev.availableDays]
      if (availableDays.includes(day)) {
        return { ...prev, availableDays: availableDays.filter((d) => d !== day) }
      } else {
        return { ...prev, availableDays: [...availableDays, day] }
      }
    })
  }

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to the server
    toast({
      title: t("settingsSaved"),
      duration: 2000,
    })
  }

  const handleDeleteAccount = () => {
    // In a real app, this would delete the account
    alert("Account deleted successfully!")
    setIsDeleteDialogOpen(false)
    // Redirect to login page or similar
  }

  const handleVacationDateChange = (type, date) => {
    setVacationDates((prev) => ({
      ...prev,
      [type]: date,
    }))
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    // In a real app, you would apply the theme to the document
  }

  const SectionHeader = ({ title, icon, section }) => (
    <div className="flex items-center justify-between cursor-pointer py-2" onClick={() => toggleSection(section)}>
      <div className="flex items-center">
        {icon}
        <h2 className="font-semibold ml-2">{title}</h2>
      </div>
      {expandedSections[section] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="p-4 flex items-center bg-white shadow-soft z-10">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">{t("settings")}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="account" className="flex flex-col items-center py-2">
              <User className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("account")}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col items-center py-2">
              <SettingsIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("preferences")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col items-center py-2">
              <Bell className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex flex-col items-center py-2">
              <Globe className="h-4 w-4 mb-1" />
              <span className="text-xs">{t("general")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            {/* Profile Settings */}
            <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
              <CardContent className="p-0">
                <SectionHeader
                  title={t("profile")}
                  icon={<User className="h-5 w-5 text-primary" />}
                  section="profile"
                />

                {expandedSections.profile && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        {t("fullName")}
                      </label>
                      <Input id="name" name="name" value={settings.name} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        {t("email")}
                      </label>
                      <Input id="email" name="email" type="email" value={settings.email} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        {t("phone")}
                      </label>
                      <Input id="phone" name="phone" value={settings.phone} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium mb-1">
                        {t("bio")}
                      </label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={settings.bio}
                        onChange={handleInputChange}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
              <CardContent className="p-0">
                <SectionHeader
                  title={t("privacy")}
                  icon={<Shield className="h-5 w-5 text-primary" />}
                  section="privacy"
                />

                {expandedSections.privacy && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("showPhone")}</p>
                        <p className="text-sm text-gray-500">{t("displayPhoneProfile")}</p>
                      </div>
                      <Switch
                        checked={settings.showPhone}
                        onCheckedChange={(checked) => handleSwitchChange("showPhone", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("showEmail")}</p>
                        <p className="text-sm text-gray-500">{t("displayEmailProfile")}</p>
                      </div>
                      <Switch
                        checked={settings.showEmail}
                        onCheckedChange={(checked) => handleSwitchChange("showEmail", checked)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-red-100 rounded-xl overflow-hidden shadow-card">
              <CardContent className="p-0">
                <SectionHeader
                  title="Danger Zone"
                  icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
                  section="danger"
                />

                {expandedSections.danger && (
                  <div className="p-4 space-y-4 border-t border-red-100">
                    <div className="bg-red-50 p-4 rounded-md">
                      <h3 className="font-medium text-red-800 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-700 mb-4">
                        This action cannot be undone. This will permanently delete your account and remove all your data
                        from our servers.
                      </p>

                      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="w-full sm:w-auto">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. Are you absolutely sure you want to delete your account?
                            </DialogDescription>
                          </DialogHeader>

                          <div className="py-4">
                            <p className="text-sm text-gray-700 mb-4">
                              Please type <strong>delete my account</strong> to confirm:
                            </p>
                            <Input
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder="delete my account"
                              className="mb-2"
                            />
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              disabled={deleteConfirmText !== "delete my account"}
                            >
                              Delete Account
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            {/* Theme Settings */}
            <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
              <CardContent className="p-0">
                <SectionHeader title={t("theme")} icon={<Moon className="h-5 w-5 text-primary" />} section="theme" />

                {expandedSections.theme && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-20"
                        onClick={() => handleThemeChange("light")}
                      >
                        <Sun className="h-6 w-6 mb-2" />
                        <span>{t("light")}</span>
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-20"
                        onClick={() => handleThemeChange("dark")}
                      >
                        <Moon className="h-6 w-6 mb-2" />
                        <span>{t("dark")}</span>
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-20"
                        onClick={() => handleThemeChange("system")}
                      >
                        <Laptop className="h-6 w-6 mb-2" />
                        <span>{t("system")}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Settings */}
            <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
              <CardContent className="p-0">
                <SectionHeader
                  title={t("location")}
                  icon={<MapPin className="h-5 w-5 text-primary" />}
                  section="location"
                />

                {expandedSections.location && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <Input id="city" name="city" value={settings.city} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-sm font-medium mb-1">
                        Province
                      </label>
                      <Select
                        value={settings.province}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, province: value }))}
                      >
                        <SelectTrigger id="province">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ab">Alberta</SelectItem>
                          <SelectItem value="bc">British Columbia</SelectItem>
                          <SelectItem value="mb">Manitoba</SelectItem>
                          <SelectItem value="nb">New Brunswick</SelectItem>
                          <SelectItem value="nl">Newfoundland and Labrador</SelectItem>
                          <SelectItem value="ns">Nova Scotia</SelectItem>
                          <SelectItem value="on">Ontario</SelectItem>
                          <SelectItem value="pe">Prince Edward Island</SelectItem>
                          <SelectItem value="qc">Quebec</SelectItem>
                          <SelectItem value="sk">Saskatchewan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {userType === "worker" && (
                      <div>
                        <label htmlFor="serviceRadius" className="block text-sm font-medium mb-1">
                          Service Radius (km)
                        </label>
                        <Input
                          id="serviceRadius"
                          name="serviceRadius"
                          type="number"
                          value={settings.serviceRadius}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          You'll only see jobs within this distance from your location
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability Settings (for workers) */}
            {userType === "worker" && (
              <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
                <CardContent className="p-0">
                  <SectionHeader
                    title={t("availability")}
                    icon={<Clock className="h-5 w-5 text-primary" />}
                    section="availability"
                  />

                  {expandedSections.availability && (
                    <div className="p-4 space-y-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm font-medium mb-2">Available Days</p>
                        <div className="flex flex-wrap gap-2">
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={settings.availableDays.includes(day) ? "default" : "outline"}
                              className={`capitalize ${
                                settings.availableDays.includes(day) ? "bg-green-600 hover:bg-green-700" : ""
                              }`}
                              onClick={() => handleDayToggle(day)}
                            >
                              {day.substring(0, 3)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
                            Start Time
                          </label>
                          <Input
                            id="startTime"
                            name="startTime"
                            type="time"
                            value={settings.startTime}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
                            End Time
                          </label>
                          <Input
                            id="endTime"
                            name="endTime"
                            type="time"
                            value={settings.endTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {/* Notification Settings */}
            <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
              <CardContent className="p-0">
                <SectionHeader
                  title={t("notifications")}
                  icon={<Bell className="h-5 w-5 text-primary" />}
                  section="notification"
                />

                {expandedSections.notification && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("emailNotifications")}</p>
                        <p className="text-sm text-gray-500">{t("receiveJobAlerts")}</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("pushNotifications")}</p>
                        <p className="text-sm text-gray-500">{t("receiveAlertsOnDevice")}</p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("smsNotifications")}</p>
                        <p className="text-sm text-gray-500">{t("receiveTextMessages")}</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => handleSwitchChange("smsNotifications", checked)}
                      />
                    </div>
                    <NotificationSettings />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vacation Status */}
            {userType === "worker" && (
              <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
                <CardContent className="p-0">
                  <SectionHeader
                    title="Vacation Status"
                    icon={<Calendar className="h-5 w-5 text-primary" />}
                    section="vacation"
                  />

                  {expandedSections.vacation && (
                    <div className="p-4 space-y-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">Set Unavailable Status</p>
                            {vacationMode && <Badge className="ml-2 bg-amber-500">Currently Unavailable</Badge>}
                          </div>
                          <p className="text-sm text-gray-500">When enabled, you won't receive new job requests</p>
                        </div>
                        <Switch checked={vacationMode} onCheckedChange={setVacationMode} />
                      </div>

                      {vacationMode && (
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Start Date</label>
                              <DatePicker
                                date={vacationDates.start}
                                setDate={(date) => handleVacationDateChange("start", date)}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">End Date</label>
                              <DatePicker
                                date={vacationDates.end}
                                setDate={(date) => handleVacationDateChange("end", date)}
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="vacationMessage" className="block text-sm font-medium mb-1">
                              Away Message (Optional)
                            </label>
                            <Textarea
                              id="vacationMessage"
                              placeholder="I'll be unavailable until further notice."
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            {/* Language Settings */}
            <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
              <CardContent className="p-0">
                <SectionHeader
                  title={t("language")}
                  icon={<Globe className="h-5 w-5 text-primary" />}
                  section="language"
                />

                {expandedSections.language && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <LanguageSwitcher />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Settings (for workers) */}
            {userType === "worker" && (
              <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
                <CardContent className="p-0">
                  <SectionHeader
                    title="Payment Settings"
                    icon={<DollarSign className="h-5 w-5 text-primary" />}
                    section="payment"
                  />

                  {expandedSections.payment && (
                    <div className="p-4 space-y-4 border-t border-gray-100">
                      <div>
                        <label htmlFor="minimumRate" className="block text-sm font-medium mb-1">
                          Minimum Rate ($/hour)
                        </label>
                        <Input
                          id="minimumRate"
                          name="minimumRate"
                          type="number"
                          value={settings.minimumRate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="preferredPayment" className="block text-sm font-medium mb-1">
                          Preferred Payment Method
                        </label>
                        <Select
                          value={settings.preferredPayment}
                          onValueChange={(value) => setSettings((prev) => ({ ...prev, preferredPayment: value }))}
                        >
                          <SelectTrigger id="preferredPayment">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                            <SelectItem value="e_transfer">E-Transfer</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="venmo">Venmo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="paymentDetails" className="block text-sm font-medium mb-1">
                          Payment Details (Optional)
                        </label>
                        <Textarea
                          id="paymentDetails"
                          name="paymentDetails"
                          value={settings.paymentDetails}
                          onChange={handleInputChange}
                          placeholder="Add payment instructions or account details here"
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This information will only be shared with clients after a job is confirmed
                        </p>
                      </div>

                      <div className="pt-2">
                        <Button variant="outline" className="w-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Connect Payment Account
                        </Button>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Connect your bank account for faster payments
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button
          onClick={handleSaveSettings}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium py-2 rounded-lg transition-all duration-200 shadow-button"
        >
          <Save className="h-4 w-4 mr-2" />
          {t("saveChanges")}
        </Button>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
