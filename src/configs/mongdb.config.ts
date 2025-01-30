import { ENV } from '@/schemas/env.schemas'
import mongoose from 'mongoose'
const mongodb_url = ENV.MONGODB_URL
export async function connectDatabase() {
  try {
    console.log('Connecting to MongoDB...', mongodb_url)
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected')
    })
    const _ = await mongoose.connect(mongodb_url, {})
  } catch (error) {
    console.error('Error connecting to MongoDB: ', error)
  }
}
