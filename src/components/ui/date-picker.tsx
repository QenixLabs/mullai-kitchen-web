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
  placeholder?: string
  minDate?: Date
  className?: string
  disabled?: boolean
}

function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  minDate,
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate)
            setOpen(false)
          }}
          initialFocus
          disabled={[
            (day) => minDate && day < minDate,
          ]}
          fromMonth={minDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
