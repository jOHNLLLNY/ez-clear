"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TranslationCoverage() {
  const { availableLanguages } = useLanguage()
  const [selectedLanguage, setSelectedLanguage] = useState<string>("uk") // Default to Ukrainian
  const [missingTranslations, setMissingTranslations] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load missing translations from localStorage
    try {
      const allMissingTranslations = JSON.parse(localStorage.getItem("missingTranslations") || "{}")
      setMissingTranslations(allMissingTranslations[selectedLanguage] || {})
    } catch (e) {
      console.error("Failed to load missing translations", e)
      setMissingTranslations({})
    } finally {
      setLoading(false)
    }
  }, [selectedLanguage])

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
    setLoading(true)
  }

  const handleClearLog = () => {
    try {
      const allMissingTranslations = JSON.parse(localStorage.getItem("missingTranslations") || "{}")
      // Clear only for the selected language
      delete allMissingTranslations[selectedLanguage]
      localStorage.setItem("missingTranslations", JSON.stringify(allMissingTranslations))
      setMissingTranslations({})
    } catch (e) {
      console.error("Failed to clear missing translations log", e)
    }
  }

  const handleExportTranslations = () => {
    // Create a properly formatted template for the missing translations
    const exportTemplate: { [key: string]: string } = {}
    Object.keys(missingTranslations).forEach((key) => {
      exportTemplate[key] = "" // Empty string to be filled in
    })

    // Convert to JSON string with proper formatting
    const jsonString = JSON.stringify(exportTemplate, null, 2)

    // Create a blob and trigger download
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `missing-translations-${selectedLanguage}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Translation Coverage</h1>
      <p className="text-muted-foreground mb-6">
        This tool shows missing translations that have been detected during app usage. Missing translations
        automatically fall back to English.
      </p>

      <div className="flex flex-row items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Select Language:</span>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages
                .filter((lang) => lang.code !== "en")
                .map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExportTranslations}
            disabled={Object.keys(missingTranslations).length === 0}
          >
            Export Template
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearLog}
            disabled={Object.keys(missingTranslations).length === 0}
          >
            Clear Log
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Missing Translations</CardTitle>
          <CardDescription>
            {loading
              ? "Loading..."
              : Object.keys(missingTranslations).length > 0
                ? `Found ${Object.keys(missingTranslations).length} missing translations for ${
                    availableLanguages.find((lang) => lang.code === selectedLanguage)?.name || selectedLanguage
                  }`
                : `No missing translations found for ${
                    availableLanguages.find((lang) => lang.code === selectedLanguage)?.name || selectedLanguage
                  }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : Object.keys(missingTranslations).length > 0 ? (
            <div className="space-y-2">
              {Object.keys(missingTranslations).map((key) => (
                <div key={key} className="p-2 border rounded-md">
                  <code className="text-sm font-mono">{key}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No missing translations recorded. Missing translations will be logged automatically when you use the app
              in this language.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            Note: This tool only shows translations that were missing during actual usage of the app. For a complete
            coverage analysis, use the Language Preview tool.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
