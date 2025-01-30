import { z } from 'zod'
import {
  eventSchema,
  eventStatusSchema,
  eventRecurrenceSchema,
  CreateEventSchema,
} from '@/schemas/calendar.schemas'

export type TEvent = z.infer<typeof eventSchema>
export type TEventStatus = z.infer<typeof eventStatusSchema>
export type TEventRecurrence = z.infer<typeof eventRecurrenceSchema>
export type TCreateEvent = z.infer<typeof CreateEventSchema>
