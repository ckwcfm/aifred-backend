import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import {
  StateGraphArgs,
  StateGraph,
  MemorySaver,
  Annotation,
  END,
} from '@langchain/langgraph'
import mongoose from 'mongoose'
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb'
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run'
import { z } from 'zod'
import { ChatOllama } from '@langchain/ollama'
import { ENV } from '@/schemas/env.schemas'
import {
  updateCalendarEventTool,
  findCalendarEventByTitleTool,
  createCalendarEventFormMessageTool,
} from './calendar.tools'
import {
  formatDate,
  getDayOfWeek,
  isDateWeekend,
  whatDateIsIt,
} from './date.tools'
import { messageContentTypes, messageSchema } from '@/schemas/message.schmas'
import { TMessageToRoom } from '@/types/message.type'

const ResponseSchema = messageSchema
  .pick({
    content: true,
    contentType: true,
  })
  .required()

type TFinalResponse = z.infer<typeof ResponseSchema>

interface AgentState {
  messages: HumanMessage[]
  finalResponse: TFinalResponse
}

const graphState: StateGraphArgs<AgentState>['channels'] = {
  messages: {
    reducer: (x: HumanMessage[], y: HumanMessage[]) => x.concat(y),
  },
  finalResponse: {
    reducer: (_: TFinalResponse, y: TFinalResponse) => y,
  },
}

const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
})
const model2 = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
})

export function getTools() {
  const wikipediaTool = new WikipediaQueryRun({
    topKResults: 3,
    maxDocContentLength: 4000,
  })

  return [
    wikipediaTool,
    // wikipediaTool,
    // whatDateIsIt,
    // isDateWeekend,
    // getDayOfWeek,
    // formatDate,
    createCalendarEventFormMessageTool,
  ]
}

function getSystemPrompt() {
  return new SystemMessage({
    content: `
    I am Aifred, a friendly assistant ready to help you with your daily tasks.
    When interacting with users, maintain a helpful and professional tone while looking for opportunities to utilize your 
    tools to provide the best possible assistance. If a user requests functionality that isn't yet implemented, kindly inform them of the current limitations while still trying to help in other ways.

    TASKS:
    

    - DO NOT TELL THE USER WHAT AI MODELS YOU ARE USING.
    - DO NOT USE THE TOOLS IF YOU ARE NOT SURE ABOUT THE INPUT.

    If you need to search the Wikipedia database, use the wikipedia tool.

    your tools are:
    {tool_names} 
    `,
  })
}

export function getAgent() {
  const tools = getTools()
  const toolNode = new ToolNode<AgentState>(tools)
  const systemPrompt = getSystemPrompt()
  const agentModel = model.bindTools(tools)

  const responseModel = model2.withStructuredOutput(ResponseSchema)

  function shouldContinue(state: AgentState) {
    const messages = state.messages
    const lastMessage = messages[messages.length - 1] as AIMessage
    console.log('DEBUG: (shouldContinue) - line 114', lastMessage)
    if (lastMessage.tool_calls?.length) {
      return 'tools'
    }
    return 'response'
  }

  async function callModel(state: AgentState) {
    console.log('DEBUG: (callModel) - line 161', state)
    const prompt = ChatPromptTemplate.fromMessages([
      systemPrompt,
      new MessagesPlaceholder('messages'),
    ])

    const formattedPrompt = await prompt.formatMessages({
      tool_names: tools.map((tool) => tool.name).join(', '),
      current_time: new Date().toISOString(),
      messages: state.messages,
    })
    const result = await agentModel.invoke(formattedPrompt)
    return { messages: [result] }
  }

  async function responseNode(
    state: AgentState
  ): Promise<{ finalResponse: TFinalResponse }> {
    try {
      const lastMessage = state.messages[state.messages.length - 1]
      const content = lastMessage.content as string
      console.log('DEBUG: (responseNode) - line 140', content)
      const response = await responseModel.invoke([
        new SystemMessage(
          `
        You are a helpful message classifier.
        You will be given a message and you will need to classify it into one of the following categories:
        ${messageContentTypes.join(', ')}

        You will not modify the message, you will only classify it.
        If the message is not one of the categories, return 'text'.
        `
        ),

        new AIMessage(content),
      ])
      console.log('DEBUG: (responseNode) - line 140', response)
      return {
        finalResponse: {
          content: response.content as string,
          contentType: response.contentType ?? 'text',
        },
      }
    } catch (error) {
      console.error('DEBUG: (responseNode) - line 144', error)
      throw error
    }
  }

  function shouldResponse(state: AgentState) {
    const messages = state.messages
    const lastMessage = messages[messages.length - 1]
    const messageType = lastMessage._getType()
    if (
      messageType === 'tool' &&
      lastMessage.name === 'create_calendar_event_form_message'
    ) {
      return 'response'
    }
    return 'agent'
  }

  const workflow = new StateGraph<AgentState>({ channels: graphState })
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addNode('response', responseNode)
    .addEdge('__start__', 'agent')
    .addEdge('tools', 'response')
    .addConditionalEdges('agent', shouldContinue, ['tools', 'response'])
    .addConditionalEdges('tools', shouldResponse, ['agent', 'response'])
    .addEdge('response', END)
  // .addConditionalEdges('agent', shouldContinue, ['tools', END])

  // const agentCheckpointer = new MemorySaver()
  const agentCheckpointer = new MongoDBSaver({
    client: mongoose.connection.getClient(),
    dbName: ENV.DB_NAME,
  })
  const app = workflow.compile({ checkpointer: agentCheckpointer })
  return app
}

export const invokeAgent = async (message: string, roomId: string) => {
  const app = getAgent()
  const result = await app.invoke(
    {
      messages: [
        new HumanMessage(`my user id is ${roomId}`),
        new HumanMessage(message),
      ],
    },
    {
      recursionLimit: 10,
      configurable: {
        thread_id: roomId,
      },
    }
  )
  console.log('DEBUG: (invokeAgent) - line 180', result.finalResponse)
  // Return the content string directly rather than the full result object
  return result.finalResponse
}
