import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // Create push_subscriptions table if it doesn't exist
    const { error: tableError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "push_subscriptions",
      definition: `
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        subscription JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      `,
    })

    if (tableError) {
      console.error("Error creating push_subscriptions table:", tableError)
      return NextResponse.json({ error: tableError.message }, { status: 500 })
    }

    // Create index on user_id for faster lookups
    const { error: indexError } = await supabaseAdmin.rpc("execute_sql", {
      sql: "CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions(user_id)",
    })

    if (indexError) {
      console.error("Error creating index:", indexError)
      return NextResponse.json({ error: indexError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Push subscriptions table created successfully" })
  } catch (error: any) {
    console.error("Error setting up push subscriptions table:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
