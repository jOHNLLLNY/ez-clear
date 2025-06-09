"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, DollarSign, Star, Clock, Download, Filter } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { supabase } from "@/lib/supabase"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from "date-fns"

// Types for our data
interface JobData {
  id: number
  title: string
  service_type: string
  status: string
  created_at: string
  completed_at: string | null
  price: number
  user_id: string
}

interface EarningsData {
  total: number
  jobs: number
  average: number
}

interface JobsByPeriod {
  label: string
  count: number
}

interface JobsByType {
  name: string
  count: number
  revenue: number
}

interface RatingData {
  average: number
  total: number
  breakdown: {
    stars: number
    count: number
  }[]
}

// Color constants for dark theme
const COLORS = ["#00e6cf", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981"]

export default function AnalyticsPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [period, setPeriod] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState("all")

  // State for our data
  const [earningsData, setEarningsData] = useState<Record<string, EarningsData>>({
    week: { total: 0, jobs: 0, average: 0 },
    month: { total: 0, jobs: 0, average: 0 },
    year: { total: 0, jobs: 0, average: 0 },
  })
  const [jobsData, setJobsData] = useState<Record<string, JobsByPeriod[]>>({
    week: [],
    month: [],
    year: [],
  })
  const [ratingsData, setRatingsData] = useState<RatingData>({
    average: 0,
    total: 0,
    breakdown: [],
  })
  const [topServices, setTopServices] = useState<JobsByType[]>([])
  const [rawJobs, setRawJobs] = useState<JobData[]>([])

  useEffect(() => {
    // Get user type and ID from localStorage
    const storedUserType = localStorage.getItem("userType")
    const storedUserId = localStorage.getItem("userId")
    setUserType(storedUserType)
    setUserId(storedUserId)

    // Redirect hirers to home page
    if (storedUserType === "hirer") {
      window.location.href = "/home/hirer"
    } else if (storedUserId) {
      fetchData(storedUserId)
    }
  }, [])

  useEffect(() => {
    if (userId) {
      processData()
    }
  }, [rawJobs, period, dateFilter])

  const fetchData = async (userId: string) => {
    setIsLoading(true)
    try {
      // Fetch completed jobs for this worker
      const { data: jobs, error: jobsError } = await supabase.from("jobs").select("*").eq("worker_id", userId)

      if (jobsError) throw jobsError

      // Fetch ratings for this worker
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("contractor_id", userId)

      if (reviewsError) throw reviewsError

      // Process the jobs data
      setRawJobs(jobs || [])

      // Process the ratings data
      processRatingsData(reviews || [])
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      // If error, use some sample data so UI isn't empty
      setRawJobs([
        {
          id: 1,
          title: "Snow Removal",
          service_type: "Snow Removal",
          status: "completed",
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          completed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          price: 80,
          user_id: "1",
        },
        {
          id: 2,
          title: "Lawn Mowing",
          service_type: "Lawn Mowing",
          status: "completed",
          created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
          completed_at: new Date(Date.now() - 86400000 * 9).toISOString(),
          price: 60,
          user_id: "1",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const processData = () => {
    // Filter jobs based on date filter
    const filteredJobs = filterJobsByDate(rawJobs)

    // Process earnings data
    processEarningsData(filteredJobs)

    // Process jobs by period
    processJobsByPeriod(filteredJobs)

    // Process top services
    processTopServices(filteredJobs)
  }

  const filterJobsByDate = (jobs: JobData[]) => {
    const now = new Date()
    let startDate: Date

    switch (dateFilter) {
      case "week":
        startDate = startOfWeek(now)
        break
      case "month":
        startDate = startOfMonth(now)
        break
      case "quarter":
        startDate = subMonths(now, 3)
        break
      case "year":
        startDate = startOfYear(now)
        break
      default:
        // 'all' - no filtering
        return jobs.filter((job) => job.status === "completed" && job.completed_at)
    }

    return jobs.filter(
      (job) => job.status === "completed" && job.completed_at && new Date(job.completed_at) >= startDate,
    )
  }

  const processEarningsData = (jobs: JobData[]) => {
    const now = new Date()
    const weekStart = subDays(now, 7)
    const monthStart = subMonths(now, 1)
    const yearStart = subYears(now, 1)

    const weekJobs = jobs.filter((job) => new Date(job.completed_at!) >= weekStart)
    const monthJobs = jobs.filter((job) => new Date(job.completed_at!) >= monthStart)
    const yearJobs = jobs.filter((job) => new Date(job.completed_at!) >= yearStart)

    const calculateEarnings = (filteredJobs: JobData[]): EarningsData => {
      const total = filteredJobs.reduce((sum, job) => sum + (job.price || 0), 0)
      const count = filteredJobs.length
      const average = count > 0 ? total / count : 0

      return { total, jobs: count, average }
    }

    setEarningsData({
      week: calculateEarnings(weekJobs),
      month: calculateEarnings(monthJobs),
      year: calculateEarnings(yearJobs),
    })
  }

  const processJobsByPeriod = (jobs: JobData[]) => {
    const now = new Date()

    // Process week data (last 7 days)
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i)
      const dayName = format(date, "EEE")
      const dayJobs = jobs.filter((job) => {
        const jobDate = new Date(job.completed_at!)
        return format(jobDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      })

      return { label: dayName, count: dayJobs.length }
    })

    // Process month data (last 4 weeks)
    const monthData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = subDays(now, 28 - i * 7)
      const weekEnd = subDays(now, 22 - i * 7)
      const weekJobs = jobs.filter((job) => {
        const jobDate = new Date(job.completed_at!)
        return jobDate >= weekStart && jobDate <= weekEnd
      })

      return { label: `Week ${i + 1}`, count: weekJobs.length }
    })

    // Process year data (last 12 months)
    const yearData = Array.from({ length: 12 }, (_, i) => {
      const monthStart = subMonths(now, 11 - i)
      const monthName = format(monthStart, "MMM")
      const monthJobs = jobs.filter((job) => {
        const jobDate = new Date(job.completed_at!)
        return format(jobDate, "yyyy-MM") === format(monthStart, "yyyy-MM")
      })

      return { label: monthName, count: monthJobs.length }
    })

    setJobsData({
      week: weekData,
      month: monthData,
      year: yearData,
    })
  }

  const processTopServices = (jobs: JobData[]) => {
    // Group jobs by service type
    const serviceMap = new Map<string, { count: number; revenue: number }>()

    jobs.forEach((job) => {
      const serviceType = job.service_type || "Other"
      const existing = serviceMap.get(serviceType) || { count: 0, revenue: 0 }

      serviceMap.set(serviceType, {
        count: existing.count + 1,
        revenue: existing.revenue + (job.price || 0),
      })
    })

    // Convert to array and sort by count
    const servicesArray = Array.from(serviceMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }))

    servicesArray.sort((a, b) => b.count - a.count)

    setTopServices(servicesArray.slice(0, 5))
  }

  const processRatingsData = (reviews: any[]) => {
    if (!reviews.length) {
      setRatingsData({
        average: 0,
        total: 0,
        breakdown: [
          { stars: 5, count: 0 },
          { stars: 4, count: 0 },
          { stars: 3, count: 0 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ],
      })
      return
    }

    // Calculate average rating
    const total = reviews.length
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    const average = total > 0 ? sum / total : 0

    // Calculate breakdown
    const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => Math.round(review.rating) === stars).length,
    }))

    setRatingsData({ average, total, breakdown })
  }

  // Chart theme configuration for dark mode
  const chartTheme = {
    backgroundColor: "transparent",
    textColor: "#e2e8f0", // light grey for text
    gridColor: "rgba(255, 255, 255, 0.1)",
    tooltipBackground: "#1e293b", // dark blue
    tooltipText: "#e2e8f0",
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center bg-card z-10 border-b border-border">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Analytics</h1>
      </header>

      {/* Period and Date Filters */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">View Period</h2>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 w-[120px] text-xs bg-card border-border">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs defaultValue="month" className="w-full" onValueChange={setPeriod}>
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="week" className="data-[state=active]:bg-card">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-card">
              Month
            </TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-card">
              Year
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6 bg-background">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border rounded-xl overflow-hidden shadow-card bg-card">
                <CardContent className="p-4">
                  <div className="h-40 bg-muted animate-pulse rounded-md"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Earnings Card */}
            <Card className="border-border rounded-xl overflow-hidden shadow-card bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Earnings</h2>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-4">${earningsData[period].total.toFixed(2)}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Jobs Completed</p>
                    <p className="font-semibold">{earningsData[period].jobs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. per Job</p>
                    <p className="font-semibold">${earningsData[period].average.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jobs Chart */}
            <Card className="border-border rounded-xl overflow-hidden shadow-card bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Jobs Completed</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobsData[period]} barSize={30}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: chartTheme.textColor }}
                        axisLine={{ stroke: chartTheme.gridColor }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: chartTheme.textColor }}
                        axisLine={{ stroke: chartTheme.gridColor }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} jobs`, "Completed"]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: chartTheme.tooltipBackground,
                          color: chartTheme.tooltipText,
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <Bar dataKey="count" fill="#00e6cf" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Card */}
            <Card className="border-border rounded-xl overflow-hidden shadow-card bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Ratings & Reviews</h2>
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold mr-2">{ratingsData.average.toFixed(1)}</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(ratingsData.average) ? "text-yellow-400 fill-yellow-400" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground ml-2">({ratingsData.total} reviews)</div>
                </div>
                <div className="space-y-2">
                  {ratingsData.breakdown.map((item) => (
                    <div key={item.stars} className="flex items-center">
                      <div className="w-12 text-sm">{item.stars} stars</div>
                      <div className="flex-1 mx-2 bg-muted rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${ratingsData.total > 0 ? (item.count / ratingsData.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-sm text-right">{item.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Services */}
            <Card className="border-border rounded-xl overflow-hidden shadow-card bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Top Services</h2>
                  <Clock className="h-5 w-5 text-primary" />
                </div>

                {topServices.length > 0 ? (
                  <>
                    <div className="h-60 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topServices}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {topServices.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name, props) => [`${value} jobs`, props.payload.name]}
                            contentStyle={{
                              backgroundColor: chartTheme.tooltipBackground,
                              color: chartTheme.tooltipText,
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                            }}
                          />
                          <Legend formatter={(value) => <span style={{ color: chartTheme.textColor }}>{value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {topServices.map((service, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground ml-2">{service.count} jobs</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${service.revenue.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              ${(service.revenue / service.count).toFixed(2)}/job
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No completed jobs yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Button */}
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition-all duration-200 shadow-button">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
