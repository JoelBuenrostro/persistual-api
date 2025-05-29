import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { UserDTO } from '../models/User';
import { createUser } from '../services/user.service';

export async function registerHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Convertir y validar el DTO
    const dto = plainToInstance(UserDTO, req.body);
    await validateOrReject(dto);

    // Crear el usuario y responder
    const result = await createUser(dto.email, dto.password);
    res.status(201).json(result);
  } catch (err: unknown) {
    // Errores de validación de class-validator
    if (Array.isArray(err)) {
      const messages = err
        .map(e => (e?.constraints ? Object.values(e.constraints) : []))
        .flat();
      res.status(400).json({ errors: messages });
      return;
    }

    // Errores de negocio lanzados como HttpError
    if (err instanceof Error) {
      const status = (err as Error & { status?: number }).status ?? 500;
      res.status(status).json({ message: err.message });
      return;
    }

    // Cualquier otro caso
    res.status(500).json({ message: 'Internal server error' });
  }
}
