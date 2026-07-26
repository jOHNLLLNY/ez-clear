"use client"

import type React from "react"

import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  date?: Date | string | null
  setDate: (date: Date | undefined) => void
  className?: string
}

function toInputValue(date?: Date | string | null) {
  if (!date) return ""

  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ""

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    if (!value) {
      setDate(undefined)
      return
    }

    const [year, month, day] = value.split("-").map(Number)
    setDate(new Date(year, month - 1, day))
  }

  return (
    <label
      className={cn(
        "relative flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="date"
        value={toInputValue(date)}
        onChange={handleChange}
        className="min-w-0 flex-1 bg-transparent text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
        aria-label="Select date"
      />
    </label>
  )
}
