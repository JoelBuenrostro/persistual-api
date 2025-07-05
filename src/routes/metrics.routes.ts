import { Router } from 'express';
import { getMetricsHandler } from '../controllers/metrics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Métricas agregadas del usuario
 */
router.get('/metrics', authMiddleware, getMetricsHandler);

export default router;
