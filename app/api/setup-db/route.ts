import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Ініціалізуємо Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Створення таблиці jobs, якщо вона не існує
    const { error: jobsError } = await supabase.rpc("create_jobs_table_if_not_exists", {})

    if (jobsError) {
      // Якщо RPC не існує, створюємо таблицю напряму
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          location TEXT NOT NULL,
          service_type TEXT NOT NULL,
          user_id UUID NOT NULL,
          worker_id UUID,
          status TEXT NOT NULL DEFAULT 'open',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_recurring BOOLEAN DEFAULT FALSE,
          recurring_frequency TEXT,
          recurring_days TEXT[],
          recurring_end_date DATE
        )
      `)

      if (error) throw error
    }

    // Create phone_verification table
    const { error: phoneVerificationError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS phone_verification (
        id SERIAL PRIMARY KEY,
        phone_number TEXT UNIQUE NOT NULL,
        code TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

    if (phoneVerificationError) {
      console.error("Error creating phone_verification table:", phoneVerificationError)
    }

    // Створення функції для інкременту лічильника
    const { error: incrementFuncError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION increment(row_id INT)
      RETURNS INT AS $$
      DECLARE
        new_count INT;
      BEGIN
        UPDATE conversations
        SET unread_count = unread_count + 1
        WHERE id = row_id
        RETURNING unread_count INTO new_count;
        
        RETURN new_count;
      END;
      $$ LANGUAGE plpgsql;
    `)

    if (incrementFuncError) {
      console.error("Error creating increment function:", incrementFuncError)
    }

    return NextResponse.json({
      message: "Database setup completed successfully",
    })
  } catch (error: any) {
    console.error("Error setting up database:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
