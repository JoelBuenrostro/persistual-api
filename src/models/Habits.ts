export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string; // ISO timestamp, p.ej. "2025-06-05T12:34:56.789Z"
}
