import type { Job } from "@/lib/database"

// Define types for our recommendation system
export interface UserRecommendationProfile {
  id: string
  location?: {
    city?: string
    province?: string
  }
  skills?: string[]
  availability?: string[]
}

export interface JobScore {
  job: Job
  score: number
  matchReasons: string[]
}

/**
 * Calculate a recommendation score for a job based on user profile
 */
export function calculateJobScore(job: Job, userProfile: UserRecommendationProfile): JobScore {
  let score = 0
  const matchReasons: string[] = []

  // Location matching (worth 3 points)
  const locationScore = calculateLocationScore(job, userProfile)
  score += locationScore * 3

  if (locationScore > 0) {
    matchReasons.push("Location match")
  }

  // Skills matching (worth 4 points)
  const skillsScore = calculateSkillsScore(job, userProfile)
  score += skillsScore * 4

  if (skillsScore > 0) {
    matchReasons.push("Skills match")
  }

  // Job recency score (worth up to 2 points)
  const recencyScore = calculateRecencyScore(job)
  score += recencyScore

  if (recencyScore > 1) {
    matchReasons.push("Recently posted")
  }

  return {
    job,
    score,
    matchReasons,
  }
}

/**
 * Calculate location match score (0-1)
 */
function calculateLocationScore(job: Job, userProfile: UserRecommendationProfile): number {
  if (!userProfile.location?.city && !userProfile.location?.province) {
    return 0 // No location data to match
  }

  // Extract city and province from job location (assuming format like "Toronto, Ontario")
  const jobLocationParts = job.location.split(",").map((part) => part.trim().toLowerCase())
  const jobCity = jobLocationParts[0]
  const jobProvince = jobLocationParts.length > 1 ? jobLocationParts[1] : ""

  const userCity = userProfile.location.city?.toLowerCase()
  const userProvince = userProfile.location.province?.toLowerCase()

  // Exact city match is best
  if (userCity && jobCity === userCity) {
    return 1
  }

  // Province match is second best
  if (userProvince && jobProvince.includes(userProvince)) {
    return 0.5
  }

  return 0
}

/**
 * Calculate skills match score (0-1)
 */
function calculateSkillsScore(job: Job, userProfile: UserRecommendationProfile): number {
  if (!userProfile.skills || userProfile.skills.length === 0) {
    return 0 // No skills data to match
  }

  // Extract job skills from title, description and service_type
  const jobText = `${job.title} ${job.description} ${job.service_type}`.toLowerCase()

  // Count how many of the user's skills appear in the job text
  const matchedSkills = userProfile.skills.filter((skill) => jobText.includes(skill.toLowerCase()))

  if (matchedSkills.length === 0) {
    return 0
  }

  // Calculate score based on percentage of matched skills
  return Math.min(matchedSkills.length / Math.min(userProfile.skills.length, 5), 1)
}

/**
 * Calculate recency score (0-2)
 * - 2 points for jobs posted within last 24 hours
 * - 1 point for jobs posted within last 72 hours
 * - 0.5 points for jobs posted within last week
 */
function calculateRecencyScore(job: Job): number {
  const jobDate = new Date(job.created_at)
  const now = new Date()
  const hoursDiff = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60)

  if (hoursDiff <= 24) {
    return 2
  } else if (hoursDiff <= 72) {
    return 1
  } else if (hoursDiff <= 168) {
    // 7 days
    return 0.5
  }

  return 0
}

/**
 * Get recommended jobs for a user
 */
export function getRecommendedJobs(jobs: Job[], userProfile: UserRecommendationProfile, limit = 5): JobScore[] {
  // Only consider open jobs
  const openJobs = jobs.filter((job) => job.status === "open")

  // Calculate scores for all jobs
  const scoredJobs = openJobs.map((job) => calculateJobScore(job, userProfile))

  // Sort by score (highest first) and take the top results
  return scoredJobs.sort((a, b) => b.score - a.score).slice(0, limit)
}
