import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../services/user.service';

export interface AuthRequest extends Request {
  user?: jwt.JwtPayload;
}

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Lanzamos el error y lo capturará el error handler global
    throw new HttpError('Token inválido o expirado', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new HttpError('Token inválido o expirado', 401);
  }
}
