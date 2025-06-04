import { Response } from 'express'; // Ya no importamos Request
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { CreateHabitDTO } from '../models/HabitDTO';
import { createHabit } from '../services/habit.service';
import { HttpError } from '../services/user.service';
import { getHabitsByUser } from '../services/habit.service';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Maneja POST /api/habits
 */
export async function createHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    // 1. Extraer userId del token (inyectado por el middleware)
    const userId = req.user!.id;

    // 2. Convertir y validar el DTO
    const dto = plainToInstance(CreateHabitDTO, req.body);
    await validateOrReject(dto);

    // 3. Llamar al servicio para crear el hábito
    const habit = createHabit(userId, dto.name, dto.description);
    res.status(201).json(habit);
  } catch (err: unknown) {
    // Errores de validación de class-validator
    if (Array.isArray(err) && err.every(e => e instanceof ValidationError)) {
      const errors = (err as ValidationError[]).flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
      return;
    }

    // Errores específicos (HttpError)
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }

    // Cualquier otro error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }

    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Maneja GET /api/habits
 * Devuelve la lista de hábitos del usuario autenticado.
 */
export async function getHabitsHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    // 1. Extraer userId del token (inyectado por el middleware)
    const userId = req.user!.id;

    // 2. Llamar al servicio para obtener hábitos de este usuario
    const habits = getHabitsByUser(userId);

    // 3. Responder con 200 OK y el array de hábitos
    res.status(200).json(habits);
  } catch (err: unknown) {
    // Solo esperamos errores muy particulares aquí,
    // pero en teoría getHabitsByUser no lanza HttpError.
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
