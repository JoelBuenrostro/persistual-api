import { Response } from 'express';
import { getMetrics } from '../services/metrics.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { HttpError } from '../services/user.service';

export async function getMetricsHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.sub as string;
    const metrics = await getMetrics(userId);
    res.status(200).json(metrics);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
