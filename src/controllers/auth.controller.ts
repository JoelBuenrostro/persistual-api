import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { UserDTO } from '../models/User';
import { LoginDTO } from '../models/Auth';
import { createUser, HttpError } from '../services/user.service';
import { authenticateUser, refreshAccessToken } from '../services/auth.service';

/**
 * Maneja el registro de usuarios (POST /api/auth/register)
 */
export async function registerHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Convierte y valida el DTO
    const dto = plainToInstance(UserDTO, req.body);
    await validateOrReject(dto);

    // Crea el usuario y devuelve id + email
    const result = await createUser(dto.email, dto.password);
    res.status(201).json(result);
  } catch (err: unknown) {
    // Errores de validación de class-validator
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
      return;
    }
    // Errores específicos del servicio (HttpError)
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    // Cualquier otro error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    // Fallback
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Maneja el login de usuarios (POST /api/auth/login)
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    // Convierte y valida el DTO
    const dto = plainToInstance(LoginDTO, req.body);
    await validateOrReject(dto);

    // Autentica y genera tokens
    const tokens = await authenticateUser(dto.email, dto.password);
    res.status(200).json(tokens);
  } catch (err: unknown) {
    // Errores de validación de class-validator
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
      return;
    }
    // Errores específicos del servicio (HttpError)
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    // Cualquier otro error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    // Fallback
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Maneja la renovación de access token (POST /api/auth/refresh)
 */
export async function refreshHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    // Verifica que se envió el token en el body
    if (typeof refreshToken !== 'string') {
      res.status(400).json({ message: 'Debe proveer el refreshToken' });
      return;
    }

    // Genera nuevo access token
    const { accessToken } = refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken });
  } catch (err: unknown) {
    // Errores específicos del servicio (HttpError)
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    // Cualquier otro error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    // Fallback
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
