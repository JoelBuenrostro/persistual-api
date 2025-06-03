import { v4 as uuid } from 'uuid';
import { Habit } from '../models/Habits';
import { HttpError } from './user.service';

/**
 * Almacén en memoria de hábitos.
 * Clave: habitId, Valor: Habit
 */
export const habitStore = new Map<string, Habit>();

/**
 * Crea un nuevo hábito para el usuario dado.
 * @param userId    ID del usuario autenticado
 * @param name      Nombre del hábito
 * @param description  Descripción (opcional)
 * @returns Habit creado
 */
export function createHabit(
  userId: string,
  name: string,
  description?: string,
): Habit {
  // Generar ID único
  const id = uuid();
  const newHabit: Habit = {
    id,
    userId,
    name,
    description,
    createdAt: new Date().toISOString(),
  };

  // Guardar en el Map
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
 * Actualiza los campos name y/o description de un hábito ya existente.
 * Lanza HttpError(404) si no existe.
 * Lanza HttpError(403) si no pertenece al userId.
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
 * Elimina un hábito. Lanza HttpError(404) si no existe, 403 si no pertenece al userId.
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
