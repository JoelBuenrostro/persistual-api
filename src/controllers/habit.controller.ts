import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateHabitDTO, UpdateHabitDTO } from '../models/HabitDTO';
import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  checkHabit,
  getHabitStreak,
} from '../services/habit.service';
import { HttpError } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * C01: POST /api/habits
 */
export async function createHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const dto = plainToInstance(CreateHabitDTO, req.body);
    await validateOrReject(dto);

    const userId = req.user!.sub as string;
    const habit = await createHabit(userId, dto);
    res.status(201).json(habit);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
    } else if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({
        message:
          err instanceof Error ? err.message : 'Error interno del servidor',
      });
    }
  }
}

/**
 * C02: GET /api/habits
 */
export async function getHabitsHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.sub as string;
    const habits = await getHabits(userId);
    res.status(200).json(habits);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

/**
 * C03: PUT /api/habits/:habitId
 */
export async function updateHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { habitId } = req.params;
    const dto = plainToInstance(UpdateHabitDTO, req.body);
    await validateOrReject(dto);

    const userId = req.user!.sub as string;
    const updated = await updateHabit(habitId, userId, dto);
    res.status(200).json(updated);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
    } else if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({
        message:
          err instanceof Error ? err.message : 'Error interno del servidor',
      });
    }
  }
}

/**
 * C04: DELETE /api/habits/:habitId
 */
export async function deleteHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { habitId } = req.params;
    const userId = req.user!.sub as string;
    await deleteHabit(habitId, userId);
    res.sendStatus(204);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

/**
 * C05: POST /api/habits/:habitId/check
 */
export async function checkHabitHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { habitId } = req.params;
    const userId = req.user!.sub as string;
    const result = await checkHabit(habitId, userId);
    res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

/**
 * C06: GET /api/habits/:habitId/streak
 */
export async function getHabitStreakHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { habitId } = req.params;
    const userId = req.user!.sub as string;
    const streak = await getHabitStreak(habitId, userId);
    res.status(200).json(streak);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
