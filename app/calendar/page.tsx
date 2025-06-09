"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, MapPin, Snowflake, Leaf, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { useLanguage } from "@/context/language-context"
import type { Job } from "@/lib/database"

export default function CalendarPage() {
  const { t } = useLanguage()
  const [userType, setUserType] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserJobs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        if (!user.id) return

        const response = await fetch(`/api/jobs?user_id=${user.id}&status=assigned,in_progress,completed`)
        if (response.ok) {
          const jobsData = await response.json()
          setJobs(jobsData)
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserJobs()
  }, [])

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const hasJobs = (date: Date) => {
    return jobs.some((job) => {
      const startDate = new Date(job.scheduled_date || job.created_at)
      const endDate = job.end_date ? new Date(job.end_date) : startDate

      return date >= startDate && date <= endDate
    })
  }

  const getJobsForDate = (date: Date) => {
    return jobs.filter((job) => {
      const startDate = new Date(job.scheduled_date || job.created_at)
      const endDate = job.end_date ? new Date(job.end_date) : startDate

      return date >= startDate && date <= endDate
    })
  }

  const getJobStatusColor = (date: Date) => {
    const dayJobs = getJobsForDate(date)
    if (dayJobs.length === 0) return ""

    const hasCompleted = dayJobs.some((job) => job.status === "completed")
    const hasInProgress = dayJobs.some((job) => job.status === "in_progress")
    const hasAssigned = dayJobs.some((job) => job.status === "assigned")

    if (hasCompleted) return "bg-green-500"
    if (hasInProgress) return "bg-blue-500"
    if (hasAssigned) return "bg-yellow-500"
    return "bg-primary"
  }

  const selectedDateJobs = getJobsForDate(selectedDate)

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center bg-card shadow-soft z-10">
        <Link
          href={userType === "worker" ? "/home/worker" : "/home/hirer"}
          className="mr-3 p-2 rounded-full hover:bg-muted transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">{t("calendar")}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4 bg-card p-3 rounded-lg">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2 bg-card p-2 rounded-t-lg">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6 bg-card p-2 rounded-b-lg">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex flex-col items-center justify-center p-1 rounded-lg ${
                day && isToday(day) ? "bg-primary/20" : ""
              } ${
                day &&
                selectedDate.getDate() === day.getDate() &&
                selectedDate.getMonth() === day.getMonth() &&
                selectedDate.getFullYear() === day.getFullYear()
                  ? "border-2 border-primary"
                  : ""
              } ${day ? "cursor-pointer hover:bg-muted transition-colors" : ""}`}
              onClick={() => day && setSelectedDate(day)}
            >
              {day && (
                <>
                  <span className={`text-sm ${isToday(day) ? "font-bold text-primary" : ""}`}>{day.getDate()}</span>
                  {hasJobs(day) && <div className={`h-1.5 w-1.5 rounded-full mt-1 ${getJobStatusColor(day)}`}></div>}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Events for Selected Date */}
        <div className="bg-card p-4 rounded-lg">
          <h3 className="font-semibold mb-3">
            {t("eventsFor")}{" "}
            {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </h3>

          {selectedDateJobs.length > 0 ? (
            <div className="space-y-3">
              {selectedDateJobs.map((job) => (
                <Card key={job.id} className="border border-border rounded-lg overflow-hidden bg-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                          job.status === "completed"
                            ? "bg-green-500/20"
                            : job.status === "in_progress"
                              ? "bg-blue-500/20"
                              : "bg-yellow-500/20"
                        }`}
                      >
                        {job.service_type === "snow_removal" && <Snowflake className="h-5 w-5" />}
                        {job.service_type === "lawn_mowing" && <Leaf className="h-5 w-5" />}
                        {!["snow_removal", "lawn_mowing"].includes(job.service_type) && (
                          <div className="h-5 w-5 rounded bg-primary/50" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{job.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {new Date(job.scheduled_date || job.created_at).toLocaleTimeString("uk-UA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          job.status === "completed"
                            ? "bg-green-900/30 text-green-400"
                            : job.status === "in_progress"
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-yellow-900/30 text-yellow-400"
                        } border-0`}
                      >
                        {job.status === "completed"
                          ? "Завершено"
                          : job.status === "in_progress"
                            ? "В процесі"
                            : "Призначено"}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Деталі
                      </Button>
                      {job.status !== "completed" && (
                        <Button className="flex-1 bg-primary hover:bg-primary/90">
                          {job.status === "assigned" ? "Почати" : "Продовжити"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
              <p>Немає робіт на цю дату</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
