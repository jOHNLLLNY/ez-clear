import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Send a test push notification
    const response = await fetch(`${request.nextUrl.origin}/api/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title: "Test Push Notification",
        description: "This is a test push notification from EZ Clear",
        data: {
          url: "/notifications",
          test: true,
          timestamp: new Date().toISOString(),
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Failed to send push notification: ${errorText}` }, { status: 500 })
    }

    const result = await response.json()
    return NextResponse.json({ success: true, message: "Test push notification sent", result })
  } catch (error: any) {
    console.error("Error sending test push notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
