import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // First, try to check if the table exists
    const { error: checkError } = await supabaseAdmin.from("notifications").select("id").limit(1)

    // If the table doesn't exist, create it directly with SQL
    if (checkError && checkError.code === "42P01") {
      // Execute SQL to create the notifications table
      const { error: createError } = await supabaseAdmin.rpc("create_notifications_table").catch(async () => {
        // Fallback: If the RPC method fails, create the table directly with SQL
        const { error } = await supabaseAdmin.query(`
          CREATE TABLE IF NOT EXISTS public.notifications (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            data JSONB,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add RLS policies
          ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
          
          -- Create policy for select
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_policies 
              WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications'
            ) THEN
              CREATE POLICY "Users can view their own notifications" 
                ON public.notifications 
                FOR SELECT 
                USING (user_id = auth.uid());
            END IF;
          END
          $$;
          
          -- Create policy for insert
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_policies 
              WHERE tablename = 'notifications' AND policyname = 'Service role can create notifications'
            ) THEN
              CREATE POLICY "Service role can create notifications" 
                ON public.notifications 
                FOR INSERT 
                WITH CHECK (true);
            END IF;
          END
          $$;
          
          -- Create policy for update
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_policies 
              WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications'
            ) THEN
              CREATE POLICY "Users can update their own notifications" 
                ON public.notifications 
                FOR UPDATE 
                USING (user_id = auth.uid());
            END IF;
          END
          $$;
        `)
        return { error }
      })

      if (createError) {
        throw createError
      }

      return NextResponse.json({ message: "Notifications table created successfully" })
    } else if (checkError) {
      throw checkError
    }

    return NextResponse.json({ message: "Notifications table already exists" })
  } catch (error: any) {
    console.error("Error setting up notifications table:", error)
    return NextResponse.json({ error: error.message || "Failed to set up notifications table" }, { status: 500 })
  }
}
