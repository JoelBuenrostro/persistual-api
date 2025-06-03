import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../services/user.service';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError('No autorizado', 401);
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    const userId = payload.sub as string;
    const email = payload.email as string;
    if (!userId || !email) {
      throw new HttpError('Token inválido', 401);
    }

    req.user = { id: userId, email };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
