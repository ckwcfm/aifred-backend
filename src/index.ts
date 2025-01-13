/**
 * Initializes and starts the Express server.
 *
 * This function performs the following tasks:
 * - Loads environment variables from a `.env` file.
 * - Starts the server configurations.
 * - Sets up middleware for JSON and URL-encoded request bodies.
 * - Defines a root route that sends a welcome message.
 * - Mounts the API routes under the `/api` path.
 * - Mounts the error handling routes.
 * - Starts the server and listens on the specified port.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>} A promise that resolves when the server has started successfully.
 */
import express, { Request, Response, Application } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { startConfigurations } from '@/configs'
import { ENV } from '@/schemas/env.schemas'
import apiRoute from '@/routes'
import { errorRoute } from './routes/error.route'

const app: Application = express()
const port = ENV.PORT || 8000

async function startServer() {
  await startConfigurations(app)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Express & TypeScript Server')
  })
  app.use('/api', apiRoute)
  app.use(errorRoute)

  app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`)
  })
}

startServer()
