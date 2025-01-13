import { Router } from 'express'
import * as UserController from './controllers/user.controller'
import { isUser } from '@/middlewares/auth.middlewares'
const router = Router()

router.get('/me', isUser, UserController.me)

export default router
