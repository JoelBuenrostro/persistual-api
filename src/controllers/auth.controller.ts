import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { UserDTO } from '../models/User';
import { LoginDTO } from '../models/Auth';
import { createUser, HttpError } from '../services/user.service';
import {
  authenticateUser,
  refreshAccessToken,
  resetPassword,
} from '../services/auth.service';
/* import logger from '../utils/logger'; */

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
    const _err = new Error('Error interno del servidor');
    res.status(500).json({ message: _err.message });
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
    const _err = new Error('Error interno del servidor'); // Renombrar 'err' a '_err'
    res.status(500).json({ message: _err.message });
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
    const _err = new Error('Error interno del servidor'); // Renombrar 'err' a '_err'
    res.status(500).json({ message: _err.message });
  }
}

/**
 * POST /api/auth/forgot
 */
export async function forgotPasswordHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email } = req.body;
    // TODO: Implement forgotPassword functionality or import it if available
    res.status(501).json({
      message: 'Funcionalidad no implementada: forgotPassword',
    });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * POST /api/auth/reset
 */
export async function resetPasswordHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res
        .status(400)
        .json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    await resetPassword(token, newPassword);
    // TODO: Implement resetPassword functionality or import it if available
    res
      .status(501)
      .json({ message: 'Funcionalidad no implementada: resetPassword' });
    // res.status(200).json({ message: 'Contraseña actualizada correctamente' });
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
