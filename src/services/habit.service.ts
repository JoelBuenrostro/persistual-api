import { googleTokenStore } from './auth.service';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { Habit } from '../models/Habits';
import { CreateHabitDTO, UpdateHabitDTO } from '../models/HabitDTO';

/**
 * Error HTTP personalizado para controlar status y mensaje.
 */
export class HttpError extends Error {
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message);
  }
}

/**
 * Almacén en memoria de hábitos: id → Habit
 */
export const habitStore = new Map<string, Habit>();

/**
 * Almacén en memoria de “checks”: habitId → lista de fechas (YYYY-MM-DD)
 */
export const checkStore = new Map<string, string[]>();

/**
 * Crea un nuevo hábito para un usuario.
 */
export async function createHabit(
  userId: string,
  dto: CreateHabitDTO,
): Promise<Habit> {
  const id = uuid();
  const now = new Date().toISOString();
  const habit: Habit = {
    id,
    userId,
    name: dto.name,
    description: dto.description,
    createdAt: now,
  };
  habitStore.set(id, habit);
  checkStore.set(id, []); // inicializamos sin checks
  return habit;
}

/**
 * Devuelve todos los hábitos de un usuario.
 */
export async function getHabits(userId: string): Promise<Habit[]> {
  return Array.from(habitStore.values()).filter(h => h.userId === userId);
}

/**
 * Actualiza un hábito existente.
 */
export async function updateHabit(
  habitId: string,
  userId: string,
  dto: UpdateHabitDTO,
): Promise<Habit> {
  const exist = habitStore.get(habitId);
  if (!exist) throw new HttpError('Hábito no encontrado', 404);
  if (exist.userId !== userId) throw new HttpError('No autorizado', 403);

  const updated = { ...exist, ...dto };
  habitStore.set(habitId, updated);
  return updated;
}

/**
 * Elimina un hábito y sus checks.
 */
export async function deleteHabit(
  habitId: string,
  userId: string,
): Promise<void> {
  const exist = habitStore.get(habitId);
  if (!exist) throw new HttpError('Hábito no encontrado', 404);
  if (exist.userId !== userId) throw new HttpError('No autorizado', 403);

  habitStore.delete(habitId);
  checkStore.delete(habitId);
}

/**
 * Marca un hábito para la fecha de hoy y devuelve la racha actual.
 */
export async function checkHabit(
  habitId: string,
  userId: string,
): Promise<{ habitId: string; date: string; currentStreak: number }> {
  const habit = habitStore.get(habitId);
  if (!habit) throw new HttpError('Hábito no encontrado', 404);
  if (habit.userId !== userId) throw new HttpError('No autorizado', 403);

  const dates = checkStore.get(habitId)!;
  const today = new Date().toISOString().split('T')[0];

  if (dates.includes(today)) {
    throw new HttpError('Ya has marcado este hábito hoy', 400);
  }

  dates.push(today);
  const { currentStreak } = await getHabitStreak(habitId, userId);

  // Crear evento en Google Calendar si hay token
  try {
    // Buscar el primer token en memoria (en producción usar el del usuario)
    const tokenEntry = Array.from(googleTokenStore.values())[0];
    if (tokenEntry?.accessToken) {
      await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          summary: `Check de hábito: ${habit.name}`,
          description: habit.description,
          start: { date: today },
          end: { date: today },
        },
        {
          headers: { Authorization: `Bearer ${tokenEntry.accessToken}` },
        },
      );
    }
  } catch (err: unknown) {
    let message = 'Google Calendar integration error';
    if (err instanceof Error) {
      message += ': ' + err.message;
    }
    throw new HttpError(message, 502);
  }

  return { habitId, date: today, currentStreak };
}

/**
 * Calcula la racha continua hasta hoy y la fecha del último check.
 */
export async function getHabitStreak(
  habitId: string,
  userId: string,
): Promise<{ habitId: string; currentStreak: number; lastCheck?: string }> {
  const habit = habitStore.get(habitId);
  if (!habit) throw new HttpError('Hábito no encontrado', 404);
  if (habit.userId !== userId) throw new HttpError('No autorizado', 403);

  const dates = checkStore.get(habitId)!;
  if (dates.length === 0) {
    return { habitId, currentStreak: 0 };
  }

  // ordenamos y eliminamos duplicados
  const uniq = Array.from(new Set(dates)).sort();
  const lastCheck = uniq[uniq.length - 1];

  // contamos días consecutivos hacia atrás
  let streak = 1;
  let prevDate = new Date(lastCheck);
  for (let i = uniq.length - 2; i >= 0; i--) {
    const currDate = new Date(uniq[i]);
    const diffDays =
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
      prevDate = currDate;
    } else {
      break;
    }
  }

  return { habitId, currentStreak: streak, lastCheck };
}
