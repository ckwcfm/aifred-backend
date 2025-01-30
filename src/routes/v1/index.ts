import { Router } from 'express'
import authRoute from '@/routes/v1/auth/auth.route'
import userRoute from '@/routes/v1/users/user.route'
import messageRoute from './messages/message.route'

const router = Router()

router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/messages', messageRoute)

export default router
