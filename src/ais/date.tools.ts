import { tool } from '@langchain/core/tools'
import { format, parseISO } from 'date-fns'
import { z } from 'zod'

export const whatDateIsIt = tool(
  async () => {
    return format(new Date(), 'yyyy-MM-dd')
  },
  {
    name: 'what_date_is_it',
    description: 'Get the current date',
  }
)

export const isDateWeekend = tool(
  async (dateStr: string) => {
    const date = parseISO(dateStr)
    const day = date.getDay()
    return day === 0 || day === 6
      ? 'Yes, this date falls on a weekend'
      : 'No, this date is a weekday'
  },
  {
    name: 'is_date_weekend',
    description: 'Check if a given date (YYYY-MM-DD format) falls on a weekend',
    schema: z.string(),
  }
)

export const getDayOfWeek = tool(
  async (dateStr: string) => {
    const date = parseISO(dateStr)
    return format(date, 'EEEE') // Returns full day name like "Monday"
  },
  {
    name: 'get_day_of_week',
    description: 'Get the day of week for a given date (YYYY-MM-DD format)',
    schema: z.string(),
  }
)

export const formatDate = tool(
  async (dateStr: string) => {
    const date = parseISO(dateStr)
    return format(date, 'MMMM do, yyyy') // Returns format like "January 1st, 2024"
  },
  {
    name: 'format_date',
    description: 'Format a date (YYYY-MM-DD) into a readable format',
    schema: z.string(),
  }
)
