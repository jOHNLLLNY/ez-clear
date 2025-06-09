import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Ініціалізуємо Supabase admin client з service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Відсутній email або пароль" }, { status: 400 })
    }

    console.log("Спроба входу:", { email })

    // Виконуємо вхід через Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Помилка аутентифікації:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const userId = authData.user.id

    // Отримуємо профіль користувача з бази даних
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError && !profileError.message.includes("No rows found")) {
      console.error("Помилка отримання профілю:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Якщо профіль не існує, створюємо його
    if (!profileData) {
      const userType = "worker" // За замовчуванням worker, якщо не вказано

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          name: email.split("@")[0],
          user_type: userType,
          created_at: new Date().toISOString(),
          is_online: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Помилка створення профілю:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        user: authData.user,
        profile: newProfile,
        session: authData.session,
      })
    }

    // Оновлюємо статус онлайн
    await supabaseAdmin.from("profiles").update({ is_online: true }).eq("id", userId)

    return NextResponse.json({
      success: true,
      user: authData.user,
      profile: profileData,
      session: authData.session,
    })
  } catch (error: any) {
    console.error("Помилка входу:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
