"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLanguage } from "@/context/language-context"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function LanguageSwitcher() {
  const { language, setLanguage, t, availableLanguages } = useLanguage()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(language)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Update value when language changes
  useEffect(() => {
    setValue(language)
  }, [language])

  // Get the current language name
  const currentLanguageName = availableLanguages.find((lang) => lang.code === value)?.name || t("language")

  return (
    <>
      {/* Mobile view - Dialog */}
      <div className="block md:hidden w-full">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {currentLanguageName}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 max-w-[350px] bg-gray-900 border-gray-800">
            <div className="sticky top-0 flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDialogOpen(false)}
                className="rounded-full h-10 w-10 bg-gray-800 hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-400" />
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto py-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors",
                    "border-b border-gray-800 last:border-0",
                    value === lang.code && "bg-gray-800",
                  )}
                  onClick={() => {
                    setLanguage(lang.code)
                    setDialogOpen(false)
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop view - Popover */}
      <div className="hidden md:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              {currentLanguageName}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={t("searchLanguage")} />
              <CommandList>
                <CommandEmpty>{t("noLanguagesFound")}</CommandEmpty>
                <CommandGroup>
                  {availableLanguages.map((lang) => (
                    <CommandItem
                      key={lang.code}
                      value={lang.code}
                      onSelect={(currentValue) => {
                        const newLang = availableLanguages.find((l) => l.code === currentValue)?.code || "en"
                        setValue(newLang)
                        setLanguage(newLang)
                        setOpen(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === lang.code ? "opacity-100" : "opacity-0")} />
                      {lang.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
