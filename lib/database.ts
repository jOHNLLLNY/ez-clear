export interface Job {
  id: number
  title: string
  description: string
  location: string
  service_type: string
  created_at: string
  user_id: string
  status: "open" | "assigned" | "completed" | "in_progress"
  image_url?: string
  scheduled_date?: string
  completed_at?: string
  application_count?: number
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

export interface Conversation {
  id: number
  user1_id: string
  user2_id: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  profile_image?: string
  business_name?: string
  city?: string
  province?: string
  description?: string
  skills?: string[]
  user_type: "worker" | "hirer"
  created_at: string
  is_online: boolean
  phone_number?: string
  phone_verified?: boolean
  dateOfBirth?: string
  emergencyContact?: string
  education?: string
  languages?: string[]
  certifications?: string[]
}

export interface Database {
  Public: {
    Tables: {
      jobs: {
        Row: Job
      }
      messages: {
        Row: Message
      }
      conversations: {
        Row: Conversation
      }
      profiles: {
        Row: UserProfile
      }
    }
  }
}
