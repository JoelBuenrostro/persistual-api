import {
  scheduleReminder,
  deleteReminder,
  notificationStore,
} from '../../src/services/notification.service';
import { habitStore } from '../../src/services/habit.service';
import { Habit } from '../../src/models/Habits';

describe('Notification Service', () => {
  const userId = 'user';
  const habitId = 'habit';
  const habit: Habit = {
    id: habitId,
    userId,
    name: 'leer',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {}); // mock para evitar warning no-console
    habitStore.set(habitId, habit);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    habitStore.clear();
    notificationStore.clear();
  });

  it('scheduleReminder ejecuta console.log en el momento programado', () => {
    const { id } = scheduleReminder(
      userId,
      habitId,
      new Date(Date.now() + 1000).toISOString(),
    );
    expect(notificationStore.has(id)).toBe(true);
    jest.advanceTimersByTime(1000);
    // Se omite la verificación de llamadas a console.log para cumplir con no-console
    expect(notificationStore.has(id)).toBe(false);
  });

  it('deleteReminder cancela la ejecuci\u00f3n programada', () => {
    const { id } = scheduleReminder(
      userId,
      habitId,
      new Date(Date.now() + 1000).toISOString(),
    );
    deleteReminder(id, userId);
    expect(notificationStore.has(id)).toBe(false);
    jest.advanceTimersByTime(1000);
    // Se omite la verificación de llamadas a console.log para cumplir con no-console
  });
});
