import { Router } from 'express'
import v1Route from '@/routes/v1'
const router = Router()

router.use('/v1', v1Route)

export default router
