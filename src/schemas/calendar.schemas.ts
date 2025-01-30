import { z } from 'zod'
import { MongoObjectIdSchema } from './mongoos.schemas'

export const eventStatusSchema = z.enum(['pending', 'confirmed', 'cancelled'])

export const eventRecurrenceSchema = z.enum([
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
])

export const eventSchema = z.object({
  title: z.string().describe('The title of the event'),
  description: z.string().describe('The description of the event'),
  startDate: z.date().describe('The start date of the event'),
  endDate: z.date().describe('The end date of the event'),
  status: eventStatusSchema
    .default('pending')
    .describe('The status of the event'),
  recurrence: eventRecurrenceSchema
    .default('none')
    .describe('The recurrence of the event'),
  userId: MongoObjectIdSchema().describe('The creator of the event'),
  location: z.string().optional().describe('The location of the event'),
  createdAt: z.date().describe('The creation date of the event'),
  updatedAt: z.date().describe('The last update date of the event'),
})

export const CreateEventSchema = eventSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    userId: true,
  })
  .extend({
    userId: z.string().describe('The creator of the event'),
  })
