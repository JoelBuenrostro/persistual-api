import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { createHabit, habitStore } from '../../src/services/habit.service';
import jwt from 'jsonwebtoken';

describe('C05: POST /api/habits/:habitId/check', () => {
  let authToken: string;
  let userId: string;
  let habitId: string;

  beforeAll(async () => {
    // 1. Crear usuario y token
    const user = await createUser('checkuser@test.com', 'secret123');
    userId = user.id;
    authToken = jwt.sign(
      { sub: userId, email: 'checkuser@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
  });

  beforeEach(() => {
    // Crear el hábito de prueba antes de cada test
    const habit = createHabit(userId, 'hacer ejercicio', 'Descripción');
    habitId = habit.id;
  });

  afterEach(() => {
    habitStore.clear();
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).post(`/api/habits/${habitId}/check`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    habitStore.clear();
    const res = await request(app)
      .post(`/api/habits/no-existe-uuid/check`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 400 si ya se marcó hoy', async () => {
    // Primera marca OK
    await request(app)
      .post(`/api/habits/${habitId}/check`)
      .set('Authorization', `Bearer ${authToken}`);

    // Segundo intento, debe fallar
    const res2 = await request(app)
      .post(`/api/habits/${habitId}/check`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res2.status).toBe(400);
    expect(res2.body.message).toBe('Ya has marcado este hábito hoy');
  });

  it('debe devolver 200 con date y currentStreak correcto', async () => {
    const res = await request(app)
      .post(`/api/habits/${habitId}/check`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('habitId', habitId);
    expect(res.body).toHaveProperty('date');
    expect(res.body).toHaveProperty('currentStreak', 1);
  });
});
