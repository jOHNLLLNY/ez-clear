import { NextResponse } from "next/server"
import prisma from "@/app/libs/prismadb"
import getCurrentUser from "@/app/actions/getCurrentUser"

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    const body = await request.json()
    const { message, image, conversationId, senderId, recipientId, senderName } = body

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image,
        conversationId: conversationId,
        senderId: currentUser.id,
        seenIds: [currentUser.id],
      },
      include: {
        sender: true,
      },
    })

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    })

    // Create notification for the recipient
    try {
      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: recipientId,
          type: "message",
          title: "New message",
          description: `You have a new message from ${senderName || "someone"}`,
          data: {
            conversation_id: conversationId,
            sender_id: senderId,
          },
        }),
      })
    } catch (notifError) {
      console.error("Error creating message notification:", notifError)
      // Continue even if notification creation fails
    }

    return NextResponse.json(newMessage)
  } catch (error) {
    console.log(error, "ERROR_MESSAGES")
    return new NextResponse("Error", { status: 500 })
  }
}
