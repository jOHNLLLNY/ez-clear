import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Check if portfolio table exists
    const { error: checkError, data: existingTables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "portfolio")

    // Create portfolio table if it doesn't exist
    if (!existingTables || existingTables.length === 0) {
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS portfolio (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      if (createError) {
        throw createError
      }

      // Set up RLS policies
      await supabase.query(`
        ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own portfolio items" 
          ON portfolio FOR SELECT 
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own portfolio items" 
          ON portfolio FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own portfolio items" 
          ON portfolio FOR UPDATE 
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own portfolio items" 
          ON portfolio FOR DELETE 
          USING (auth.uid() = user_id);
      `)
    }

    return NextResponse.json({ success: true, message: "Portfolio table setup complete" })
  } catch (error) {
    console.error("Error setting up portfolio table:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
