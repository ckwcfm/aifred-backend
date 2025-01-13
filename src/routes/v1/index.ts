import { Router } from 'express'
import authRoute from '@/routes/v1/auth/auth.route'
import userRoute from '@/routes/v1/users/user.route'

const router = Router()

router.use('/auth', authRoute)
router.use('/users', userRoute)
export default router
