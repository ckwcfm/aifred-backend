import { Router } from 'express'
import * as MessageController from './controllers/message.controller'

const router = Router()

router.get('/:roomId', MessageController.roomMessages)

export default router
