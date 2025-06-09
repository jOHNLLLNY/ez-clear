import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Ініціалізуємо Supabase admin client з service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Перевіряємо підключення до Supabase
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from("profiles")
      .select("count")
      .limit(1)

    if (connectionError) {
      return NextResponse.json(
        {
          success: false,
          message: "Помилка підключення до Supabase",
          error: connectionError.message,
        },
        { status: 500 },
      )
    }

    // Перевіряємо налаштування auth
    const { data: authSettings, error: authError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 })

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          message: "Помилка доступу до Auth API",
          error: authError.message,
        },
        { status: 500 },
      )
    }

    // Тестуємо створення тестового користувача
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = "password123"

    const { data: testUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })

    if (createUserError) {
      return NextResponse.json(
        {
          success: false,
          message: "Не вдалося створити тестового користувача",
          error: createUserError.message,
        },
        { status: 500 },
      )
    }

    // Тестуємо створення профілю для тестового користувача
    const { data: testProfile, error: createProfileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: testUser.user.id,
        email: testEmail,
        name: "Test User",
        user_type: "worker",
        created_at: new Date().toISOString(),
        is_online: true,
      })
      .select()
      .single()

    if (createProfileError) {
      return NextResponse.json(
        {
          success: false,
          message: "Не вдалося створити тестовий профіль",
          error: createProfileError.message,
          user: testUser.user,
        },
        { status: 500 },
      )
    }

    // Видаляємо тестового користувача
    await supabaseAdmin.auth.admin.deleteUser(testUser.user.id)

    return NextResponse.json({
      success: true,
      message: "Діагностика Supabase успішна",
      connectionTest,
      authSettings: {
        users: authSettings.users.length,
        total: authSettings.total,
      },
      testUser: {
        id: testUser.user.id,
        email: testUser.user.email,
        created_at: testUser.user.created_at,
      },
      testProfile,
    })
  } catch (error: any) {
    console.error("Помилка діагностики Supabase:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Помилка діагностики Supabase",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
