import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Create function to check if column exists
    const { error: functionError1 } = await supabaseAdmin.rpc("create_function_if_not_exists", {
      function_name: "get_column_info",
      function_args: "target_table text, target_column text",
      function_returns: "TABLE(column_name text, data_type text)",
      function_body: `
          RETURN QUERY
          SELECT column_name::text, data_type::text
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = target_table
          AND column_name = target_column;
        `,
      function_language: "plpgsql",
      function_security: "DEFINER",
    })

    if (functionError1) {
      console.error("Error creating get_column_info function:", functionError1)
      return NextResponse.json({ error: functionError1.message }, { status: 500 })
    }

    // Create function to add column if not exists
    const { error: functionError2 } = await supabaseAdmin.rpc("create_function_if_not_exists", {
      function_name: "add_column_if_not_exists",
      function_args: "target_table text, target_column text, column_type text, default_value text",
      function_returns: "void",
      function_body: `
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = target_table
              AND column_name = target_column
            ) THEN
              EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s DEFAULT %s',
                target_table, target_column, column_type, default_value);
            END IF;
          END;
        `,
      function_language: "plpgsql",
      function_security: "DEFINER",
    })

    if (functionError2) {
      console.error("Error creating add_column_if_not_exists function:", functionError2)
      return NextResponse.json({ error: functionError2.message }, { status: 500 })
    }

    // Create function to enable realtime for a table
    const { error: functionError3 } = await supabaseAdmin.rpc("create_function_if_not_exists", {
      function_name: "enable_realtime_for_table",
      function_args: "target_table text",
      function_returns: "void",
      function_body: `
          BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', target_table);
          EXCEPTION
            WHEN duplicate_object THEN
              NULL;
          END;
        `,
      function_language: "plpgsql",
      function_security: "DEFINER",
    })

    if (functionError3) {
      console.error("Error creating enable_realtime_for_table function:", functionError3)
      return NextResponse.json({ error: functionError3.message }, { status: 500 })
    }

    // Create function to create other functions if they don't exist
    const { error: metaFunctionError } = await supabaseAdmin.query(`
      CREATE OR REPLACE FUNCTION create_function_if_not_exists(
        function_name text,
        function_args text,
        function_returns text,
        function_body text,
        function_language text,
        function_security text
      ) RETURNS void AS $$
      DECLARE
        func_exists boolean;
      BEGIN
        SELECT EXISTS (
          SELECT 1
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public'
          AND p.proname = function_name
        ) INTO func_exists;
        
        IF NOT func_exists THEN
          EXECUTE format('
            CREATE OR REPLACE FUNCTION public.%I(%s)
            RETURNS %s AS $func$
            %s
            $func$ LANGUAGE %I SECURITY %s;
          ', 
          function_name, 
          function_args, 
          function_returns, 
          function_body, 
          function_language, 
          function_security);
        END IF;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)

    if (metaFunctionError) {
      console.error("Error creating meta function:", metaFunctionError)
      return NextResponse.json({ error: metaFunctionError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database functions created successfully" })
  } catch (error: any) {
    console.error("Error setting up database functions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
