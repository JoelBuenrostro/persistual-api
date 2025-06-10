import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { CreateHabitDTO, UpdateHabitDTO } from '../models/HabitDTO';
import {
  createHabit,
  getHabitsByUser,
  getHabitById,
  updateHabit,
  deleteHabit,
} from '../services/habit.service';
import { HttpError } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Maneja POST /api/habits
 */
export async function createHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const dto = plainToInstance(CreateHabitDTO, req.body);
    await validateOrReject(dto);
    const habit = createHabit(userId, dto.name, dto.description);
    res.status(201).json(habit);
  } catch (err: unknown) {
    if (Array.isArray(err) && err.every(e => e instanceof ValidationError)) {
      const errors = (err as ValidationError[]).flatMap(e =>
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

/**
 * Maneja GET /api/habits
 */
export async function getHabitsHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const habits = getHabitsByUser(userId);
    res.status(200).json(habits);
  } catch (err: unknown) {
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

/**
 * Maneja PUT /api/habits/:habitId
 */
export async function updateHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { habitId } = req.params;

    // 1. Verificar existencia y pertenencia antes de validar el body
    const existing = getHabitById(habitId);
    if (!existing) {
      res.status(404).json({ message: 'Hábito no encontrado' });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ message: 'No autorizado' });
      return;
    }

    // 2. Validar el DTO de actualización
    const dto = plainToInstance(UpdateHabitDTO, req.body);
    await validateOrReject(dto);

    // 3. Actualizar y devolver
    const updated = updateHabit(habitId, userId, {
      name: dto.name,
      description: dto.description,
    });
    res.status(200).json(updated);
  } catch (err: unknown) {
    if (Array.isArray(err) && err.every(e => e instanceof ValidationError)) {
      const errors = (err as ValidationError[]).flatMap(e =>
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

/**
 * Maneja DELETE /api/habits/:habitId
 */
export async function deleteHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { habitId } = req.params;

    // 1. Verificar existencia y pertenencia
    const existing = getHabitById(habitId);
    if (!existing) {
      res.status(404).json({ message: 'Hábito no encontrado' });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ message: 'No autorizado' });
      return;
    }

    // 2. Eliminar y devolver 204
    deleteHabit(habitId, userId);
    res.sendStatus(204);
  } catch (err: unknown) {
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
