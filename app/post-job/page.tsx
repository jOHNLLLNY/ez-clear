"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, X, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import BottomNavigation from "@/components/bottom-navigation"
import { useLanguage } from "@/context/language-context"
import { motion } from "framer-motion"

export default function PostJob() {
  const { user } = useAuth()
  const router = useRouter()
  const { language, t } = useLanguage()

  const [formData, setFormData] = useState({
    title: "",
    service_type: "",
    description: "",
    location: "",
  })

  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const services = [
    { id: "snow_removal", label: language === "en" ? "Snow Removal" : "Прибирання снігу" },
    { id: "landscaping", label: language === "en" ? "Landscaping" : "Ландшафтний дизайн" },
    { id: "lawn_mowing", label: language === "en" ? "Lawn Mowing" : "Стрижка газону" },
    { id: "gutter_cleaning", label: language === "en" ? "Gutter Cleaning" : "Чистка водостоків" },
    { id: "leaf_cleanup", label: language === "en" ? "Leaf Cleanup" : "Прибирання листя" },
    { id: "junk_removal", label: language === "en" ? "Junk Removal" : "Вивіз сміття" },
    { id: "power_washing", label: language === "en" ? "Power Washing" : "Миття під тиском" },
    { id: "handyman", label: language === "en" ? "Handyman" : "Дрібний ремонт" },
    { id: "ice_control", label: language === "en" ? "Ice Control" : "Боротьба з льодом" },
  ]

  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringOptions, setRecurringOptions] = useState({
    frequency: "weekly",
    days: [],
    endDate: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleServiceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      service_type: value,
    }))
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRecurringOptionChange = (name, value) => {
    setRecurringOptions((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDayToggle = (day) => {
    setRecurringOptions((prev) => {
      const days = [...prev.days]
      if (days.includes(day)) {
        return { ...prev, days: days.filter((d) => d !== day) }
      } else {
        return { ...prev, days: [...days, day] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.service_type || !formData.description || !formData.location) {
      alert(language === "en" ? "Please fill in all required fields" : "Будь ласка, заповніть всі обов'язкові поля")
      return
    }

    try {
      setIsSubmitting(true)

      // Get user ID from localStorage
      let userId = user?.id
      if (!userId && typeof window !== "undefined") {
        // Try to get the current user ID
        userId = localStorage.getItem("currentUserId")

        // If still no user ID, use a default one
        if (!userId) {
          userId = "00000000-0000-0000-0000-000000000000"
          localStorage.setItem("currentUserId", userId)
        }
      }

      // Prepare job data
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        service_type: formData.service_type,
        user_id: userId, // Use the proper UUID
        status: "open",
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringOptions.frequency : null,
        recurring_days: isRecurring ? recurringOptions.days : null,
        recurring_end_date: isRecurring && recurringOptions.endDate ? recurringOptions.endDate : null,
      }

      // Send job data to API
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create job")
      }

      // Redirect to home
      router.push("/home/hirer")
    } catch (error) {
      console.error("Error creating job:", error)
      alert(
        language === "en" ? "Failed to create job. Please try again." : "Не вдалося створити роботу. Спробуйте ще раз.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Translations
  const pageTitle = language === "en" ? "Create Job" : "Створити завдання"
  const serviceTypeLabel = language === "en" ? "Service Type" : "Тип послуги"
  const jobTitleLabel = language === "en" ? "Job Title" : "Назва завдання"
  const addressLabel = language === "en" ? "Address" : "Адреса"
  const descriptionLabel = language === "en" ? "Job Description" : "Опис завдання"
  const addPhotoLabel = language === "en" ? "Add Photo (optional)" : "Додати фото (необов'язково)"
  const uploadLabel = language === "en" ? "Upload" : "Додати"
  const recurringJobLabel = language === "en" ? "Recurring Job" : "Регулярне завдання"
  const recurringDescLabel =
    language === "en" ? "Schedule this job on a regular basis" : "Запланувати це завдання на регулярній основі"
  const frequencyLabel = language === "en" ? "Frequency" : "Частота"
  const weeklyLabel = language === "en" ? "Weekly" : "Щотижня"
  const biweeklyLabel = language === "en" ? "Biweekly" : "Раз на два тижні"
  const monthlyLabel = language === "en" ? "Monthly" : "Щомісяця"
  const customLabel = language === "en" ? "Custom" : "Інше"
  const daysOfWeekLabel = language === "en" ? "Days of week" : "Дні тижня"
  const endDateLabel = language === "en" ? "End Date (optional)" : "Дата закінчення (необов'язково)"
  const endDateDescLabel =
    language === "en" ? "Leave empty if no end date" : "Залиште порожнім, якщо немає кінцевої дати"
  const createJobLabel = language === "en" ? "Create Job" : "Створити завдання"
  const creatingLabel = language === "en" ? "Creating..." : "Створення..."

  const weekdays = [
    { id: "monday", label: language === "en" ? "Mon" : "Пн" },
    { id: "tuesday", label: language === "en" ? "Tue" : "Вт" },
    { id: "wednesday", label: language === "en" ? "Wed" : "Ср" },
    { id: "thursday", label: language === "en" ? "Thu" : "Чт" },
    { id: "friday", label: language === "en" ? "Fri" : "Пт" },
    { id: "saturday", label: language === "en" ? "Sat" : "Сб" },
    { id: "sunday", label: language === "en" ? "Sun" : "Нд" },
  ]

  return (
    <div className="app-container">
      <header className="p-4 flex items-center bg-card shadow-medium z-10">
        <Link href="/home/hirer" className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">{pageTitle}</h1>
      </header>

      <div className="page-content">
        <Card className="border border-border rounded-2xl shadow-card bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service_type" className="text-foreground">
                  {serviceTypeLabel}
                </Label>
                <Select value={formData.service_type} onValueChange={handleServiceChange} required>
                  <SelectTrigger id="service_type" className="border-border bg-muted focus:ring-primary/20 rounded-xl">
                    <SelectValue placeholder={language === "en" ? "Select service type" : "Виберіть тип послуги"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="focus:bg-muted focus:text-foreground">
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  {jobTitleLabel}
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder={
                    language === "en" ? "e.g., Snow removal from driveway" : "напр., Прибирання снігу з під'їзду"
                  }
                  value={formData.title}
                  onChange={handleChange}
                  className="border-border bg-muted focus:ring-primary/20 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">
                  {addressLabel}
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder={language === "en" ? "e.g., 123 Main St, City" : "напр., вул. Шевченка 10, Київ"}
                  value={formData.location}
                  onChange={handleChange}
                  className="border-border bg-muted focus:ring-primary/20 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  {descriptionLabel}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={language === "en" ? "Describe the job in detail..." : "Детально опишіть завдання..."}
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[120px] border-border bg-muted focus:ring-primary/20 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">{addPhotoLabel}</Label>
                <div className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      className="relative h-20 w-20 rounded-xl overflow-hidden border border-border"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Job image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 shadow-medium"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                  {images.length < 4 && (
                    <motion.div
                      className="h-20 w-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/30 hover:bg-muted transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">{uploadLabel}</span>
                      </label>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recurring" className="text-foreground">
                      {recurringJobLabel}
                    </Label>
                    <p className="text-xs text-muted-foreground">{recurringDescLabel}</p>
                  </div>
                  <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                </div>

                {isRecurring && (
                  <div className="space-y-4 mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="space-y-2">
                      <Label htmlFor="frequency" className="text-foreground">
                        {frequencyLabel}
                      </Label>
                      <Select
                        value={recurringOptions.frequency}
                        onValueChange={(value) => handleRecurringOptionChange("frequency", value)}
                      >
                        <SelectTrigger
                          id="frequency"
                          className="border-border bg-muted focus:ring-primary/20 rounded-xl"
                        >
                          <SelectValue placeholder={language === "en" ? "Select frequency" : "Виберіть частоту"} />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="weekly">{weeklyLabel}</SelectItem>
                          <SelectItem value="biweekly">{biweeklyLabel}</SelectItem>
                          <SelectItem value="monthly">{monthlyLabel}</SelectItem>
                          <SelectItem value="custom">{customLabel}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {recurringOptions.frequency === "weekly" && (
                      <div className="space-y-2">
                        <Label className="text-foreground">{daysOfWeekLabel}</Label>
                        <div className="flex flex-wrap gap-2">
                          {weekdays.map((day) => (
                            <Button
                              key={day.id}
                              type="button"
                              variant={recurringOptions.days.includes(day.id) ? "default" : "outline"}
                              className={`rounded-lg ${
                                recurringOptions.days.includes(day.id)
                                  ? "bg-primary hover:bg-primary/90"
                                  : "bg-muted border-border"
                              }`}
                              onClick={() => handleDayToggle(day.id)}
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-foreground">
                        {endDateLabel}
                      </Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={recurringOptions.endDate}
                        onChange={(e) => handleRecurringOptionChange("endDate", e.target.value)}
                        className="border-border bg-muted focus:ring-primary/20 rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">{endDateDescLabel}</p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-200 shadow-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {creatingLabel}
                  </>
                ) : (
                  createJobLabel
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
