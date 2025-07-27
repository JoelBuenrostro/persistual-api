import { habitStore, checkStore } from './habit.service';

export interface Metrics {
  totalHabits: number;
  totalChecks: number;
  longestStreak: number;
}

export function getMetrics(userId: string): Metrics {
  const habits = Array.from(habitStore.values()).filter(
    h => h.userId === userId,
  );
  const totalHabits = habits.length;

  let totalChecks = 0;
  let longestStreak = 0;

  for (const h of habits) {
    const dates = checkStore.get(h.id) || [];
    totalChecks += dates.length;

    // convertimos a días numéricos
    const days = Array.from(new Set(dates))
      .map(d => Math.floor(new Date(d).getTime() / 86400000))
      .sort((a, b) => a - b);

    let current = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i] === days[i - 1] + 1) {
        current++;
      } else {
        longestStreak = Math.max(longestStreak, current);
        current = 1;
      }
    }
    longestStreak = Math.max(longestStreak, current);
  }

  return { totalHabits, totalChecks, longestStreak };
}
