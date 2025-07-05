import { v4 as uuidv4 } from 'uuid';
import { Habit } from '../models/Habits';
import { CreateHabitDTO, UpdateHabitDTO } from '../models/HabitDTO';
import { HttpError } from './user.service';

/**
 * Almacena los hábitos en memoria (mapa id → Habit)
 */
export const habitStore = new Map<string, Habit>();

/**
 * Almacena las fechas de “check” de cada hábito (mapa habitId → array de fechas ISO “YYYY-MM-DD”)
 */
export const checkStore = new Map<string, string[]>();

/**
 * Crea un nuevo hábito para un usuario.
 */
export async function createHabit(
  userId: string,
  dto: CreateHabitDTO,
): Promise<Habit> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const habit: Habit = {
    id,
    userId,
    name: dto.name,
    description: dto.description,
    createdAt,
  };
  habitStore.set(id, habit);
  // Inicializa su array de checks
  checkStore.set(id, []);
  return habit;
}

/**
 * Devuelve todos los hábitos de un usuario.
 */
export async function getHabits(userId: string): Promise<Habit[]> {
  return Array.from(habitStore.values()).filter(h => h.userId === userId);
}

/**
 * Actualiza nombre y/o descripción de un hábito.
 */
export async function updateHabit(
  habitId: string,
  userId: string,
  dto: UpdateHabitDTO,
): Promise<Habit> {
  const existing = habitStore.get(habitId);
  if (!existing) throw new HttpError('Hábito no encontrado', 404);
  if (existing.userId !== userId) throw new HttpError('No autorizado', 403);

  const updated: Habit = {
    ...existing,
    name: dto.name ?? existing.name,
    description: dto.description ?? existing.description,
  };
  habitStore.set(habitId, updated);
  return updated;
}

/**
 * Elimina un hábito (y sus checks) de un usuario.
 */
export async function deleteHabit(
  habitId: string,
  userId: string,
): Promise<void> {
  const existing = habitStore.get(habitId);
  if (!existing) throw new HttpError('Hábito no encontrado', 404);
  if (existing.userId !== userId) throw new HttpError('No autorizado', 403);

  habitStore.delete(habitId);
  checkStore.delete(habitId);
}

/**
 * Marca un “check” para el hábito en la fecha actual.
 */
export async function checkHabit(
  habitId: string,
  userId: string,
): Promise<{ habitId: string; date: string; currentStreak: number }> {
  const existing = habitStore.get(habitId);
  if (!existing) throw new HttpError('Hábito no encontrado', 404);
  if (existing.userId !== userId) throw new HttpError('No autorizado', 403);

  const today = new Date().toISOString().split('T')[0];
  const dates = checkStore.get(habitId)!;

  if (dates.includes(today)) {
    throw new HttpError('Ya has marcado este hábito hoy', 400);
  }

  dates.push(today);
  checkStore.set(habitId, dates);

  // Calcula la racha actual (días consecutivos hasta hoy)
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i];
    const expected = new Date();
    expected.setDate(new Date().getDate() - streak);
    if (d === expected.toISOString().split('T')[0]) {
      streak++;
    } else {
      break;
    }
  }

  return { habitId, date: today, currentStreak: streak };
}

/**
 * Obtiene la racha actual y la fecha del último check.
 */
export async function getHabitStreak(
  habitId: string,
  userId: string,
): Promise<{ habitId: string; currentStreak: number; lastCheck?: string }> {
  const existing = habitStore.get(habitId);
  if (!existing) throw new HttpError('Hábito no encontrado', 404);
  if (existing.userId !== userId) throw new HttpError('No autorizado', 403);

  const dates = checkStore.get(habitId)!;
  if (dates.length === 0) {
    return { habitId, currentStreak: 0 };
  }

  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i];
    const expected = new Date();
    expected.setDate(new Date().getDate() - streak);
    if (d === expected.toISOString().split('T')[0]) {
      streak++;
    } else {
      break;
    }
  }

  const lastCheck = dates[dates.length - 1];
  return { habitId, currentStreak: streak, lastCheck };
}
