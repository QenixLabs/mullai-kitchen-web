"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, addDays } from "date-fns"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void | ((value: Date | undefined) => void)
  value?: Date
  onChange?: (date: Date | undefined) => void | ((value: Date | undefined) => void)
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  disabled?: boolean | ((date: Date) => boolean)
}

function DatePicker({
  date,
  onDateChange,
  value,
  onChange,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Support both date/onDateChange and value/onChange conventions
  const selectedDate = value !== undefined ? value : date
  const handleChange = onChange || onDateChange

  // Build disabled array combining minDate, maxDate, and custom disabled function
  const disabledMatchers: Array<(date: Date) => boolean> = [
    (day) => !!minDate && day < minDate,
    (day) => !!maxDate && day > maxDate,
    ...(typeof disabled === 'function' ? [disabled] : []),
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={typeof disabled === 'boolean' ? disabled : false}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(selectedDate) => {
            handleChange?.(selectedDate)
            setOpen(false)
          }}
          initialFocus
          disabled={disabledMatchers}
          fromMonth={minDate}
          toMonth={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
