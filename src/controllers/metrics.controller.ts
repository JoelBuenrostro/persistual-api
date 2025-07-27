import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getMetrics } from '../services/metrics.service';
import { HttpError } from '../services/user.service';

export async function getMetricsHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    // authMiddleware ya ha validado el token y llenado req.user
    const userId = req.user!.sub as string;
    const metrics = getMetrics(userId);
    res.status(200).json(metrics);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
