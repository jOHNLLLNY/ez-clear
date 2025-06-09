export interface Profile {
  id: string
  name: string
  email: string
  profile_image?: string
  business_name?: string
  city?: string
  province?: string
  description?: string
  user_type: "worker" | "hirer"
  created_at: string
  is_online: boolean
}
