import { v4 as uuid } from 'uuid';
import { habitStore } from './habit.service';
import { HttpError } from './user.service';

interface NotificationJob {
  id: string;
  userId: string;
  habitId: string;
  date: string;
  timeout: NodeJS.Timeout;
}

export const notificationStore = new Map<string, NotificationJob>();

export function scheduleReminder(
  userId: string,
  habitId: string,
  date: string,
): { id: string; habitId: string; date: string } {
  const target = new Date(date);
  if (isNaN(target.getTime())) {
    throw new HttpError('Fecha inv\u00e1lida', 400);
  }

  const habit = habitStore.get(habitId);
  if (!habit) {
    throw new HttpError('H\u00e1bito no encontrado', 404);
  }
  if (habit.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }

  const id = uuid();
  const delay = target.getTime() - Date.now();
  const timeout = setTimeout(() => {
    const h = habitStore.get(habitId);
    // eslint-disable-next-line no-console
    console.log(`Hoy toca marcar ${h ? h.name : habitId}`);
    notificationStore.delete(id);
  }, Math.max(delay, 0));

  notificationStore.set(id, { id, userId, habitId, date: target.toISOString(), timeout });
  return { id, habitId, date: target.toISOString() };
}

export function deleteReminder(id: string, userId: string): void {
  const job = notificationStore.get(id);
  if (!job) {
    throw new HttpError('Recordatorio no encontrado', 404);
  }
  if (job.userId !== userId) {
    throw new HttpError('No autorizado', 403);
  }

  clearTimeout(job.timeout);
  notificationStore.delete(id);
}
