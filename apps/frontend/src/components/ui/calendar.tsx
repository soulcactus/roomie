"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rdp-theme w-full p-0", className)}
      classNames={{
        root: "relative w-full overflow-hidden",
        months: "w-full",
        month: "w-full space-y-3",
        caption: "flex h-9 w-full min-w-0 flex-nowrap items-center gap-2 px-1",
        month_caption: "flex h-9 w-full min-w-0 flex-nowrap items-center gap-2 px-1 pr-12",
        caption_label:
          "order-1 min-w-0 flex-1 truncate text-left text-sm font-semibold tracking-tight text-foreground",
        nav: "absolute right-1 top-1 flex shrink-0 items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 shrink-0 rounded-md bg-background/90 p-0 text-foreground shadow-none"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 shrink-0 rounded-md bg-background/90 p-0 text-foreground shadow-none"
        ),
        month_grid: "w-full border-collapse table-fixed",
        weekdays: "mt-1",
        weekday:
          "h-8 w-[14.2857%] p-0 text-center text-[11px] font-medium text-muted-foreground",
        week: "mt-1",
        day: "h-9 w-[14.2857%] p-0 text-center text-sm align-middle",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "mx-auto h-8 w-8 rounded-full p-0 font-normal hover:bg-accent"
        ),
        selected:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "",
        outside: "text-muted-foreground opacity-40",
        disabled: "text-muted-foreground opacity-30",
        hidden: "invisible",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        range_middle: "bg-accent text-accent-foreground",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
