import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getMetricsHandler } from '../controllers/metrics.controller';

const router = Router();

router.get('/metrics', authMiddleware, getMetricsHandler);

export default router;
