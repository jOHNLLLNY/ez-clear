import type { Language } from "@/context/language-context"

/**
 * Adds translations to localStorage cache for later review and integration
 */
export function addTranslation(key: string, translations: { [language in Language]?: string }, override = false) {
  if (typeof window === "undefined") return false

  try {
    // Get current temp translations
    const tempTranslations = JSON.parse(localStorage.getItem("tempTranslations") || "{}")

    // For each provided translation
    Object.entries(translations).forEach(([lang, text]) => {
      // Initialize the structure if needed
      if (!tempTranslations[key]) {
        tempTranslations[key] = {}
      }

      // Only add if it doesn't exist or override is true
      if (override || !tempTranslations[key][lang]) {
        tempTranslations[key][lang] = text
      }
    })

    // Save back to localStorage
    localStorage.setItem("tempTranslations", JSON.stringify(tempTranslations))
    return true
  } catch (e) {
    console.error("Failed to add translation", e)
    return false
  }
}

/**
 * Checks if a translation exists for a key in the specified language
 */
export function hasTranslation(
  key: string,
  language: Language,
  translations: any, // Use the actual translations type
): boolean {
  if (key.includes(".")) {
    const [section, subKey] = key.split(".")
    return !!translations[section]?.[subKey]?.[language]
  }

  return !!translations[key]?.[language]
}

/**
 * Gets all missing translations for all languages
 */
export function getAllMissingTranslations(): { [language in Language]?: string[] } | null {
  if (typeof window === "undefined") return null

  try {
    const missingTranslations = JSON.parse(localStorage.getItem("missingTranslations") || "{}")

    // Convert from object format to array format for each language
    const result: { [language in Language]?: string[] } = {}

    Object.entries(missingTranslations).forEach(([lang, keys]) => {
      if (typeof keys === "object") {
        result[lang as Language] = Object.keys(keys)
      }
    })

    return result
  } catch (e) {
    console.error("Failed to get missing translations", e)
    return null
  }
}
