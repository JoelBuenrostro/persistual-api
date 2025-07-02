import { v4 as uuidv4 } from 'uuid';
import { HttpError } from './user.service';
import { CreateHabitDTO, UpdateHabitDTO } from '../models/HabitDTO';
import { Habit } from '../models/Habits';

/**
 * Internamente guardamos, además de los datos del hábito, un array de fechas marcadas.
 */
interface StoredHabit extends Habit {
  checks: string[];
}

/**
 * Almacén en memoria de hábitos.
 */
export const habitStore = new Map<string, StoredHabit>();

/**
 * Crea un nuevo hábito para un usuario.
 */
export async function createHabit(
  userId: string,
  dto: CreateHabitDTO,
): Promise<Habit> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const stored: StoredHabit = {
    id,
    userId,
    name: dto.name,
    description: dto.description,
    createdAt,
    checks: [],
  };
  habitStore.set(id, stored);
  return {
    id,
    userId,
    name: stored.name,
    description: stored.description,
    createdAt,
  };
}

/**
 * Devuelve todos los hábitos de un usuario.
 */
export async function getHabits(userId: string): Promise<Habit[]> {
  return Array.from(habitStore.values())
    .filter(h => h.userId === userId)
    .map(({ id, userId: uid, name, description, createdAt }) => ({
      id,
      userId: uid,
      name,
      description,
      createdAt,
    }));
}

/**
 * Actualiza un hábito (nombre y/o descripción).
 */
export async function updateHabit(
  habitId: string,
  userId: string,
  dto: UpdateHabitDTO,
): Promise<Habit> {
  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('Hábito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }
  if (dto.name !== undefined) {
    habit.name = dto.name;
  }
  if (dto.description !== undefined) {
    habit.description = dto.description;
  }
  return {
    id: habit.id,
    userId: habit.userId,
    name: habit.name,
    description: habit.description,
    createdAt: habit.createdAt,
  };
}

/**
 * Elimina un hábito.
 */
export async function deleteHabit(
  habitId: string,
  userId: string,
): Promise<void> {
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
 * Marca un hábito para el día de hoy y calcula la racha.
 * Lanza HttpError(400) si ya estaba marcado hoy.
 */
export async function checkHabit(
  habitId: string,
  userId: string,
): Promise<{ habitId: string; date: string; currentStreak: number }> {
  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('Hábito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }

  const today = new Date().toISOString().split('T')[0];
  const lastCheck = habit.checks[habit.checks.length - 1];

  if (lastCheck === today) {
    // ¡Ya marcado hoy!
    throw new HttpError('Ya has marcado este hábito hoy', 400);
  }

  habit.checks.push(today);
  const currentStreak = calculateStreak(habit.checks);
  return { habitId, date: today, currentStreak };
}

/**
 * Obtiene la racha actual de un hábito sin marcarlo de nuevo.
 */
export async function getHabitStreak(
  habitId: string,
  userId: string,
): Promise<{ habitId: string; currentStreak: number; lastCheck?: string }> {
  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('Hábito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }
  const checks = habit.checks;
  const currentStreak = checks.length > 0 ? calculateStreak(checks) : 0;
  const lastCheck = checks.length > 0 ? checks[checks.length - 1] : undefined;
  return { habitId, currentStreak, lastCheck };
}

/**
 * Helper: dadas fechas ISO (YYYY-MM-DD) ordenadas, cuenta cuántos días consecutivos hacia atrás.
 */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  let streak = 1;
  for (let i = dates.length - 2; i >= 0; i--) {
    const curr = new Date(dates[i + 1]);
    const prev = new Date(dates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Re-exportamos HttpError para que lo puedan importar los controladores
export { HttpError };
