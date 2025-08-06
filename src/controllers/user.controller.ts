import { UpdateUserRoleDTO } from '../models/User';
import { updateUserRole } from '../services/user.service';
/**
 * PATCH /api/users/:id/role
 * Cambia el rol de un usuario (solo admin)
 */
export async function updateUserRoleHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateUserRoleDTO, req.body);
    await validateOrReject(dto);
    const result = updateUserRole(id, dto.role);
    res.status(200).json(result);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
    } else if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getUserById, updateUser, HttpError } from '../services/user.service';
import { UserDTO } from '../models/User';

/**
 * GET /api/users/me
 * Devuelve { id, email } extraídos del token.
 */
export async function getProfileHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.sub as string;
    const profile = getUserById(userId);
    res.status(200).json(profile);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

/**
 * PATCH /api/users/me
 * Permite actualizar solo el email del usuario.
 */
export async function updateProfileHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    // Validar solo el email recibido
    const dto = plainToInstance(UserDTO, { email: req.body.email });
    await validateOrReject(dto);

    const userId = req.user!.sub as string;
    const updated = updateUser(userId, dto.email);

    res.status(200).json(updated);
  } catch (err: unknown) {
    // errores de validación de class-validator
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
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
