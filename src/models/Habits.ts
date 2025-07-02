/**
 * Representa un hábito creado por un usuario.
 */
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
}
