import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select(`
        *,
        user:user_id(id, name, profile_image, business_name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error fetching job ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Failed to fetch job" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const { data, error } = await supabaseAdmin.from("jobs").update(body).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error updating job ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { error } = await supabaseAdmin.from("jobs").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error deleting job ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Failed to delete job" }, { status: 500 })
  }
}
