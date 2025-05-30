import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { UserDTO } from '../models/User';
import { LoginDTO } from '../models/Auth';
import { createUser, HttpError } from '../services/user.service';
import { authenticateUser } from '../services/auth.service';

/**
 * Maneja el registro de usuarios (POST /auth/register)
 */
export async function registerHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const dto = plainToInstance(UserDTO, req.body);
    await validateOrReject(dto);

    const result = await createUser(dto.email, dto.password);
    res.status(201).json(result);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
      return;
    }
    if (err instanceof HttpError) {
      // Errror de negocio con status
      res.status(err.status).json({ message: err.message });
      return;
    }
    if (err instanceof Error) {
      // Otros errores de JS/TS
      res.status(500).json({ message: err.message });
      return;
    }
    // Fallback
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Maneja el login de usuarios (POST /auth/login)
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const dto = plainToInstance(LoginDTO, req.body);
    await validateOrReject(dto);

    const tokens = await authenticateUser(dto.email, dto.password);
    res.status(200).json(tokens);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
