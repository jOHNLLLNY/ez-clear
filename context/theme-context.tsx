"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ThemeContextType {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with a default theme for server-side rendering
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system")

  // Move localStorage access to useEffect to ensure it only runs on the client
  useEffect(() => {
    // Now safely access localStorage on the client side
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (savedTheme) {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const setTheme = (newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme)

    // Only access localStorage on the client
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme)
      applyTheme(newTheme)
    }
  }

  // Helper function to apply theme to document
  const applyTheme = (theme: "light" | "dark" | "system") => {
    if (typeof window === "undefined") return

    document.documentElement.classList.toggle(
      "dark",
      theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches),
    )
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
