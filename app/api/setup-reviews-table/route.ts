import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if the reviews table exists
    const { error: checkError } = await supabase.from("reviews").select("id").limit(1)

    // If we can query the table without error, it exists
    if (!checkError) {
      return NextResponse.json({ message: "Reviews table already exists" })
    }

    // Create the reviews table with SQL
    const { error: createError } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          contractor_id UUID NOT NULL REFERENCES profiles(id),
          reviewer_id UUID NOT NULL REFERENCES profiles(id),
          recipient_id UUID NOT NULL REFERENCES profiles(id),
          rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          service TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(contractor_id, reviewer_id)
        );
        
        -- Add RLS policies
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
        
        -- Anyone can read reviews
        CREATE POLICY "Reviews are viewable by everyone" 
        ON reviews FOR SELECT 
        USING (true);
        
        -- Only the reviewer can insert their own review
        CREATE POLICY "Users can insert their own reviews" 
        ON reviews FOR INSERT 
        WITH CHECK (reviewer_id = auth.uid());
        
        -- Only the reviewer can update their own review
        CREATE POLICY "Users can update their own reviews" 
        ON reviews FOR UPDATE 
        USING (reviewer_id = auth.uid());
        
        -- Only the reviewer can delete their own review
        CREATE POLICY "Users can delete their own reviews" 
        ON reviews FOR DELETE 
        USING (reviewer_id = auth.uid());
      `,
    })

    if (createError) {
      console.error("Error creating reviews table:", createError)
      return NextResponse.json({ error: "Failed to create reviews table" }, { status: 500 })
    }

    return NextResponse.json({ message: "Reviews table created successfully" })
  } catch (error) {
    console.error("Error in setup-reviews-table API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
