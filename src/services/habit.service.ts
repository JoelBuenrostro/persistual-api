import { v4 as uuid } from 'uuid';
import { Habit } from '../models/Habits';
import { HttpError } from './user.service';

/**
 * Almacén en memoria de hábitos.
 * Clave: habitId, Valor: Habit
 */
export const habitStore = new Map<string, Habit>();

/**
 * Almacena los “checks” diarios.
 * Clave: `${userId}:${habitId}`, Valor: Set de fechas en formato 'YYYY-MM-DD'
 */
const checkStore = new Map<string, Set<string>>();

/**
 * Crea un nuevo hábito para el usuario dado.
 */
export function createHabit(
  userId: string,
  name: string,
  description?: string,
): Habit {
  const id = uuid();
  const newHabit: Habit = {
    id,
    userId,
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  habitStore.set(id, newHabit);
  return newHabit;
}

/**
 * Recupera todos los hábitos de un usuario.
 */
export function getHabitsByUser(userId: string): Habit[] {
  return Array.from(habitStore.values()).filter(h => h.userId === userId);
}

/**
 * Recupera un hábito por su ID.
 */
export function getHabitById(habitId: string): Habit | undefined {
  return habitStore.get(habitId);
}

/**
 * Actualiza name/description de un hábito.
 * - Lanza HttpError(404) si el hábito no existe.
 * - Lanza HttpError(403) si el hábito no pertenece al userId.
 */
export function updateHabit(
  habitId: string,
  userId: string,
  data: { name?: string; description?: string },
): Habit {
  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('Hábito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }

  if (data.name !== undefined) {
    habit.name = data.name;
  }
  if (data.description !== undefined) {
    habit.description = data.description;
  }

  habitStore.set(habitId, habit);
  return habit;
}

/**
 * Elimina un hábito existente.
 * - Lanza HttpError(404) si no existe.
 * - Lanza HttpError(403) si no pertenece al userId.
 */
export function deleteHabit(habitId: string, userId: string): void {
  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('Hábito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }
  habitStore.delete(habitId);
}

/**
 * Marca un hábito como realizado hoy y calcula la racha actual.
 * @throws HttpError(404) si el hábito no existe.
 * @throws HttpError(403) si el hábito no pertenece al userId.
 * @throws HttpError(400) si ya está marcado hoy.
 */
export function markHabit(
  userId: string,
  habitId: string,
): { habitId: string; date: string; currentStreak: number } {
  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('Hábito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }

  const today = new Date().toISOString().slice(0, 10);
  const key = `${userId}:${habitId}`;
  const dates = checkStore.get(key) ?? new Set<string>();

  if (dates.has(today)) {
    throw new HttpError('Ya has marcado este hábito hoy', 400);
  }

  dates.add(today);
  checkStore.set(key, dates);

  let streak = 1;
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 1);
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { habitId, date: today, currentStreak: streak };
}

/**
 * Consulta la racha actual de un hábito.
 * @throws HttpError(404) si el hábito no existe.
 * @throws HttpError(403) si el hábito no pertenece al userId.
 */
export function getHabitStreak(
  userId: string,
  habitId: string,
): { habitId: string; currentStreak: number; lastCheck?: string } {
  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('Hábito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }

  const key = `${userId}:${habitId}`;
  const dates = checkStore.get(key) ?? new Set<string>();

  if (dates.size === 0) {
    return { habitId, currentStreak: 0 };
  }

  // Encontrar la última fecha marcada
  const sortedDates = Array.from(dates).sort((a, b) => (a < b ? 1 : -1));
  const lastCheck = sortedDates[0];

  // Calcular racha desde hoy hacia atrás
  let streak = 0;
  const cursor = new Date();
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { habitId, currentStreak: streak, lastCheck };
}
