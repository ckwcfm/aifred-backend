import { Event } from '@/models/calendar.model'
import {
  eventRecurrenceSchema,
  eventStatusSchema,
} from '@/schemas/calendar.schemas'
import { messageContentTypesSchema } from '@/schemas/message.schmas'
import { TEvent } from '@/types/calendar.types'
import { TMessageToRoom } from '@/types/message.type'
import { tool } from '@langchain/core/tools'
import { format, parseISO } from 'date-fns'
import { z } from 'zod'

const CalendarEventInputSchema = z.object({
  title: z.string().describe('The title of the event'),
  userId: z.string().describe('The creator of the event'),
  description: z.string().describe('The description of the event'),
  startDate: z.string().describe('The start date of the event'),
  endDate: z.string().describe('The end date of the event'),
  status: eventStatusSchema.describe('The status of the event'),
  recurrence: eventRecurrenceSchema.describe('The recurrence of the event'),
  location: z.string().describe('The location of the event'),
})

const CreateCalendarEventFormToolSchema = CalendarEventInputSchema.pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  status: true,
  recurrence: true,
  location: true,
}).partial()

export const createCalendarEventFormMessageTool = tool(
  async (
    input: z.infer<typeof CreateCalendarEventFormToolSchema>
  ): Promise<{ messages: Pick<TMessageToRoom, 'content' | 'contentType'> }> => {
    console.log('DEBUG: (createCalendarEventFormMessageTool) - line 34', input)
    const fromContent = {
      form: 'create_calendar_event_form',
      input: input,
    }
    const message: Pick<TMessageToRoom, 'content' | 'contentType'> = {
      contentType: 'form',
      content: JSON.stringify(fromContent),
    }
    return { messages: message }
  },
  {
    name: 'create_calendar_event_form_message',
    description: 'Create a new calendar event form message',
    schema: CreateCalendarEventFormToolSchema,
  }
)

const CreateCalendarEventToolSchema = z.object({
  title: z.string().describe('The title of the event'),
  userId: z.string().describe('The creator of the event'),
  description: z.string().describe('The description of the event'),
  startDate: z.string().describe('The start date of the event'),
  endDate: z.string().describe('The end date of the event'),
  status: eventStatusSchema.describe('The status of the event'),
  recurrence: eventRecurrenceSchema.describe('The recurrence of the event'),
  location: z.string().describe('The location of the event'),
})

const UpdateCalendarEventToolSchema =
  CreateCalendarEventToolSchema.partial().extend({
    id: z.string().describe('The id of the event to update'),
  })

export const createCalendarEventTool = tool(
  async (
    input: z.infer<typeof CreateCalendarEventToolSchema>
  ): Promise<TEvent> => {
    try {
      console.log('DEBUG: (createCalendarEventTool) - line 11', input)

      const event = await Event.create({
        title: input.title,
        description: input.description,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: input.status,
        recurrence: input.recurrence,
        location: input.location,
        userId: input.userId,
      })
      console.log('DEBUG: (createCalendarEventTool) - line 35, created', event)
      return event.toObject()
    } catch (error) {
      console.log('DEBUG: (createCalendarEventTool) - line 14', error)
      throw new Error('Failed to create calendar event')
    }
  },
  {
    name: 'create_calendar_event',
    description: 'Create a new calendar event',
    schema: CreateCalendarEventToolSchema,
  }
)

export const updateCalendarEventTool = tool(
  async (
    input: z.infer<typeof UpdateCalendarEventToolSchema>
  ): Promise<TEvent> => {
    try {
      console.log('DEBUG: (updateCalendarEventTool) - line 62', input)
      const event = await Event.findByIdAndUpdate(input.id, input, {
        new: true,
      })
      if (!event) {
        throw new Error('Event not found')
      }
      return event.toObject()
    } catch (error) {
      console.log('DEBUG: (updateCalendarEventTool) - line 57', error)
      throw new Error('Failed to update calendar event')
    }
  },
  {
    name: 'update_calendar_event',
    description: 'Update a calendar event',
    schema: UpdateCalendarEventToolSchema,
  }
)

const FindCalendarEventByTitleToolSchema = z.object({
  title: z.string().describe('The title of the event'),
  userId: z.string().describe('The creator of the event'),
})

export const findCalendarEventByTitleTool = tool(
  async (
    input: z.infer<typeof FindCalendarEventByTitleToolSchema>
  ): Promise<TEvent> => {
    console.log('DEBUG: (findCalendarEventByTitleTool) - line 82', input)
    const events = await Event.find({
      title: { $regex: new RegExp('^' + input.title + '$', 'i') },
      userId: input.userId,
    }).limit(1)
    if (!events) {
      throw new Error('No events found')
    }
    console.log('DEBUG: (findCalendarEventByTitleTool) - line 99', events)
    return events[0].toObject()
  },
  {
    name: 'find_calendar_event_by_title',
    description: 'Find a calendar event by title',
    schema: FindCalendarEventByTitleToolSchema,
  }
)

const testCreateCalendarEvent = async (
  input: z.infer<typeof CreateCalendarEventToolSchema>
) => {
  try {
    console.log('DEBUG: (testCreateCalendarEvent) - line 54', input)
    const event = await Event.create({
      title: input.title,
      description: input.description,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: input.status,
      recurrence: input.recurrence,
      location: input.location,
      userId: input.userId,
    })
    console.log('DEBUG: (testCreateCalendarEvent) - line 66', event)

    return event
  } catch (error) {
    console.log('DEBUG: (testCreateCalendarEvent) - line 57', error)
    throw new Error('Failed to create calendar event')
  }
}

// testCreateCalendarEvent({
//   description: 'Test Event Description',
//   endDate: '2023-02-02T14:00:00Z',
//   location: 'SF Cafe',
//   recurrence: 'none',
//   startDate: '2023-02-02T12:00:00Z',
//   status: 'pending',
//   title: 'Test Event',
//   userId: '67889521ad430be8d96e50c2',
// })

// "title": "Lunch with Sandy",
// "userId": "67889521ad430be8d96e50c2"
