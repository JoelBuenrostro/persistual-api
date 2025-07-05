import { getHabits } from './habit.service';
import { checkStore } from './habit.service'; // asumiendo que exportas aquí Map<habitId,string[]>

function isNextDay(prev: string, next: string): boolean {
  const d1 = new Date(prev);
  const d2 = new Date(next);
  // comprueba que la fecha de next sea exactamente 1 día después
  return (
    d2.getUTCFullYear() === d1.getUTCFullYear() &&
    d2.getUTCMonth() === d1.getUTCMonth() &&
    d2.getUTCDate() - d1.getUTCDate() === 1
  );
}

export interface Metrics {
  totalHabits: number;
  totalChecks: number;
  longestStreak: number;
}

export async function getMetrics(userId: string): Promise<Metrics> {
  // 1. Trae todos los hábitos del usuario
  const habits = await getHabits(userId);
  const totalHabits = habits.length;

  let totalChecks = 0;
  let longestStreak = 0;

  for (const h of habits) {
    // 2. Cuenta checks de este hábito
    const checks = checkStore.get(h.id) ?? [];
    totalChecks += checks.length;

    // 3. Calcula la racha más larga en este hábito
    if (checks.length > 0) {
      const sorted = [...checks].sort(); // fechas ISO ordenan bien
      let current = 1;
      let maxForHabit = 1;

      for (let i = 1; i < sorted.length; i++) {
        if (isNextDay(sorted[i - 1], sorted[i])) {
          current++;
        } else {
          maxForHabit = Math.max(maxForHabit, current);
          current = 1;
        }
      }
      maxForHabit = Math.max(maxForHabit, current);
      longestStreak = Math.max(longestStreak, maxForHabit);
    }
  }

  return { totalHabits, totalChecks, longestStreak };
}
