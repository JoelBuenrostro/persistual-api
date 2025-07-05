// tests/services/habit.service.test.ts

import { createHabit, checkStore } from '../../src/services/habit.service';
import { CreateHabitDTO } from '../../src/models/HabitDTO';

describe('Habit Service — exportación y comportamiento de checkStore', () => {
  const userId = 'test-user';

  it('debe exportar checkStore como un Map', () => {
    expect(checkStore).toBeInstanceOf(Map);
  });

  it('al crear un hábito, checkStore debe tener una entrada con un array vacío', async () => {
    // DTO mínimo para crear un hábito
    const dto: CreateHabitDTO = { name: 'Prueba hábito' };

    const habit = await createHabit(userId, dto);

    // La clave debe existir en checkStore
    expect(checkStore.has(habit.id)).toBe(true);

    // Y el valor asociado debe ser un array vacío
    const checks = checkStore.get(habit.id);
    expect(Array.isArray(checks)).toBe(true);
    expect(checks).toHaveLength(0);
  });
});
