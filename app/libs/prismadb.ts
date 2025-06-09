// This file provides compatibility for legacy Prisma references
// All database operations should use Supabase instead

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseKey)

// Export as prisma for compatibility with existing code
const prisma = {
  // Add any legacy methods that might be referenced
  user: {
    findUnique: async (params: any) => {
      const { data } = await supabase.from("profiles").select("*").eq("id", params.where.id).single()
      return data
    },
    findMany: async (params?: any) => {
      const { data } = await supabase.from("profiles").select("*")
      return data || []
    },
    create: async (params: any) => {
      const { data } = await supabase.from("profiles").insert(params.data).select().single()
      return data
    },
    update: async (params: any) => {
      const { data } = await supabase.from("profiles").update(params.data).eq("id", params.where.id).select().single()
      return data
    },
  },
}

export default prisma
