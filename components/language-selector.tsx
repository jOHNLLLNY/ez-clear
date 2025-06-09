"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages } = useLanguage()
  const [open, setOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(language)

  // Get the current language name
  const currentLanguageName = availableLanguages.find((lang) => lang.code === language)?.name || "English"

  // Update selected language when language context changes
  useEffect(() => {
    setSelectedLanguage(language)
  }, [language])

  // Handle language selection
  const handleSelectLanguage = (langCode: string) => {
    setLanguage(langCode as any)
    setOpen(false)
  }

  return (
    <div className="w-full">
      {/* Language selector button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-md text-white"
      >
        <span>{currentLanguageName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-gray-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Language selection dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-[350px] bg-gray-900 border-gray-800 rounded-lg">
          <div className="sticky top-0 flex justify-center items-center p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="absolute right-2 rounded-full h-10 w-10 bg-gray-800 hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto py-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                className={`w-full px-4 py-3 text-center text-white hover:bg-gray-800 transition-colors
                  border-b border-gray-800 last:border-0
                  ${selectedLanguage === lang.code ? "bg-gray-800" : ""}`}
                onClick={() => handleSelectLanguage(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
