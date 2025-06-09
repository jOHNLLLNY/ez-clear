// Service Worker for handling push notifications
self.addEventListener("install", (event) => {
  console.log("Service Worker installed")
  // Skip waiting to ensure the service worker activates immediately
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated")
  // Claim clients to ensure the service worker controls all pages
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  console.log("Push notification received", event)

  let data = { title: "EZ Clear Notification", description: "New notification" }

  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (e) {
    console.error("Error parsing push notification data:", e)
  }

  const options = {
    body: data.description || "New notification",
    icon: "/icons/notification-icon.png",
    badge: "/icons/badge-icon.png",
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title || "EZ Clear Notification", options))
})

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked", event)

  event.notification.close()

  if (event.action === "close") {
    return
  }

  // Default action is to open the app and navigate to the appropriate page
  const urlToOpen = new URL(event.notification.data.url || "/", self.location.origin).href

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If a window client is already open, focus it
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus()
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})
