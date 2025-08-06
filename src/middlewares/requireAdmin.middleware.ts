import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { HttpError } from '../services/user.service';

export function requireAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== 'admin') {
    throw new HttpError('Solo administradores', 403);
  }
  next();
}
