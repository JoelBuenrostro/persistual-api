import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { createHabit, habitStore } from '../../src/services/habit.service';
import jwt from 'jsonwebtoken';
import { Habit } from '../../src/models/Habits';

describe('C04: DELETE /api/habits/:habitId', () => {
  let authToken: string;
  let userId: string;
  let anotherToken: string;
  let habitId: string;

  beforeAll(async () => {
    // Crear usuario A y token
    const userA = await createUser('userA_del@test.com', 'secret123');
    userId = userA.id;
    authToken = jwt.sign(
      { sub: userId, email: 'userA_del@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    // Crear usuario B y token (para probar 403)
    const userB = await createUser('userB_del@test.com', 'secret123');
    anotherToken = jwt.sign(
      { sub: userB.id, email: 'userB_del@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
  });

  beforeEach(() => {
    // Crear un hábito limpio para userA
    const habit = createHabit(userId, 'hacer ejercicio', 'Descripción');
    habitId = habit.id;
  });

  afterEach(() => {
    habitStore.clear();
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).delete(`/api/habits/${habitId}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    habitStore.clear();
    const fakeId = 'no-existe-uuid';
    const res = await request(app)
      .delete(`/api/habits/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 403 si el hábito pertenece a otro usuario', async () => {
    const res = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${anotherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('No autorizado');
  });

  it('debe devolver 204 al eliminar correctamente', async () => {
    const res = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(204);

    // Verificar que ya no haya hábitos
    const res2 = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res2.status).toBe(200);

    // Tipamos la respuesta como arreglo de Habit
    const habits = res2.body as Habit[];
    expect(habits.length).toBe(0);
  });
});
