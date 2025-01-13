import e, { Router } from 'express'
import v1Route from '@/routes/v1'
import { errorRoute } from './error.route'
const router = Router()

router.use('/v1', v1Route)

export default router
