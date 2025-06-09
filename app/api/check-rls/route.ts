import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Ініціалізуємо Supabase admin client з service role key для обходу RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Ініціалізуємо публічний клієнт з anon key
const supabasePublic = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    // Створюємо тестового користувача
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

    const userId = testUser.user.id

    // Тест 1: Вставка профілю через admin клієнт
    const { data: adminInsertData, error: adminInsertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email: testEmail,
        name: "Test Admin Insert",
        user_type: "worker",
        created_at: new Date().toISOString(),
        is_online: true,
      })
      .select()
      .single()

    // Тест 2: Спроба вставки через публічний клієнт
    const testId2 = crypto.randomUUID()
    const { data: publicInsertData, error: publicInsertError } = await supabasePublic
      .from("profiles")
      .insert({
        id: testId2,
        email: `test-${Date.now()}@example.com`,
        name: "Test Public Insert",
        user_type: "worker",
        created_at: new Date().toISOString(),
        is_online: true,
      })
      .select()
      .single()

    // Тест 3: Спроба вставки через публічний клієнт з авторизацією
    const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    let authInsertData = null
    let authInsertError = null

    if (!authError) {
      const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session?.access_token}`,
            },
          },
        },
      )

      const testId3 = crypto.randomUUID()
      const result = await supabaseAuth
        .from("profiles")
        .insert({
          id: testId3,
          email: `test-${Date.now()}@example.com`,
          name: "Test Auth Insert",
          user_type: "worker",
          created_at: new Date().toISOString(),
          is_online: true,
        })
        .select()
        .single()

      authInsertData = result.data
      authInsertError = result.error
    }

    // Видаляємо тестового користувача
    await supabaseAdmin.auth.admin.deleteUser(userId)

    return NextResponse.json({
      success: true,
      message: "Перевірка RLS завершена",
      adminInsert: {
        success: !adminInsertError,
        error: adminInsertError ? adminInsertError.message : null,
        data: adminInsertData,
      },
      publicInsert: {
        success: !publicInsertError,
        error: publicInsertError ? publicInsertError.message : null,
        data: publicInsertData,
      },
      authInsert: {
        success: !authInsertError,
        error: authInsertError ? authInsertError.message : null,
        data: authInsertData,
      },
      rls: {
        message: "Якщо adminInsert успішний, але publicInsert і authInsert невдалі, то RLS налаштовано правильно",
      },
    })
  } catch (error: any) {
    console.error("Помилка перевірки RLS:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Помилка перевірки RLS",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
