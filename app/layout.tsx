import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/auth-context"
import { UserProvider } from "@/context/user-context"
import { NotificationProvider } from "@/context/notification-context"
import { ServiceWorkerInit } from "./service-worker-init"
import { OnlineStatusProvider } from "@/components/online-status-provider"
import { LanguageProvider } from "@/context/language-context"
import ErrorBoundary from "@/components/error-boundary"
import { ThemeProvider } from "@/context/theme-context"
import { Suspense } from "react"
import { EnvironmentCheck } from "@/components/environment-check"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EZ Clear",
  description: "Find and hire local service providers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} pb-16`}>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <EnvironmentCheck />
          </Suspense>
          <ThemeProvider>
            <AuthProvider>
              <UserProvider>
                <LanguageProvider>
                  <NotificationProvider>
                    <OnlineStatusProvider>
                      <ServiceWorkerInit />
                      <LanguageObserver />
                      {children}
                    </OnlineStatusProvider>
                  </NotificationProvider>
                </LanguageProvider>
              </UserProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

// Component to observe language changes and apply them globally
function LanguageObserver() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Apply initial language from localStorage
              const savedLanguage = localStorage ? (localStorage.getItem('language') || 'en') : 'en';
              document.documentElement.setAttribute('lang', savedLanguage);
              document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
              
              // Listen for language changes
              document.addEventListener('languageChanged', function(e) {
                const lang = e.detail.language;
                document.documentElement.setAttribute('lang', lang);
                document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
              });
            } catch (e) {
              // Fallback if localStorage is not available (e.g., during SSR)
              document.documentElement.setAttribute('lang', 'en');
              document.documentElement.setAttribute('dir', 'ltr');
            }
          })();
        `,
      }}
    />
  )
}
