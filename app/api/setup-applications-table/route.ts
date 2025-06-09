import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // Create the job_applications table if it doesn't exist
    // Use the REST API to execute SQL directly
    const { data, error } = await supabaseAdmin.from("job_applications").select("id").limit(1)

    if (error && error.message.includes("does not exist")) {
      // Table doesn't exist, create it
      // We'll use multiple separate statements to avoid issues with complex SQL

      // 1. Create the basic table
      await supabaseAdmin.from("_sql").insert({
        query: `
        CREATE TABLE IF NOT EXISTS public.job_applications (
          id SERIAL PRIMARY KEY,
          job_id INTEGER NOT NULL,
          applicant_id UUID NOT NULL,
          message TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          conversation_id INTEGER
        );
      `,
      })

      // 2. Add indexes
      await supabaseAdmin.from("_sql").insert({
        query: `
        CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
        CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id);
      `,
      })

      // 3. Set up RLS
      await supabaseAdmin.from("_sql").insert({
        query: `
        ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
      `,
      })

      // 4. Create policies
      await supabaseAdmin.from("_sql").insert({
        query: `
        CREATE POLICY "Anyone can view job applications" 
          ON public.job_applications 
          FOR SELECT 
          USING (true);
      `,
      })

      await supabaseAdmin.from("_sql").insert({
        query: `
        CREATE POLICY "Authenticated users can apply for jobs" 
          ON public.job_applications 
          FOR INSERT 
          TO authenticated 
          WITH CHECK (true);
      `,
      })

      await supabaseAdmin.from("_sql").insert({
        query: `
        CREATE POLICY "Users can update their own applications" 
          ON public.job_applications 
          FOR UPDATE 
          TO authenticated 
          USING (applicant_id = auth.uid());
      `,
      })

      return NextResponse.json({ success: true, message: "Job applications table created successfully" })
    }

    return NextResponse.json({ success: true, message: "Job applications table already exists" })
  } catch (error: any) {
    console.error("Error setting up job_applications table:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to set up job_applications table" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Check if the job_applications table exists
    const { error } = await supabaseAdmin.from("job_applications").select("id").limit(1)

    if (error && error.message.includes("does not exist")) {
      return NextResponse.json({ exists: false, message: "Job applications table does not exist" })
    }

    return NextResponse.json({ exists: true, message: "Job applications table exists" })
  } catch (error: any) {
    console.error("Error checking job_applications table:", error)
    return NextResponse.json({ error: error.message || "Failed to check job_applications table" }, { status: 500 })
  }
}
