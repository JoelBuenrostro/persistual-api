import request from 'supertest';
import app from '../../src/index';
import { createHabit, habitStore } from '../../src/services/habit.service';
import { createUser } from '../../src/services/user.service';

describe('C05: POST /api/habits/:habitId/check', () => {
  let userId: string;
  let authToken: string;
  let habitId: string;

  beforeAll(async () => {
    // Creamos usuario y obtenemos token
    const email = 'check@test.com';
    const password = 'secret123';
    const user = await createUser(email, password);
    userId = user.id;
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    authToken = loginRes.body.accessToken;
  });

  beforeEach(() => {
    // Limpiamos el store antes de cada test
    habitStore.clear();
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).post(`/api/habits/${habitId}/check`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    const res = await request(app)
      .post(`/api/habits/${habitId}/check`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 400 si ya se marcó hoy', async () => {
    // Creamos un hábito y lo marcamos una vez
    const habit = await createHabit(userId, { name: 'hacer ejercicio' });
    habitId = habit.id;

    await request(app)
      .post(`/api/habits/${habitId}/check`)
      .set('Authorization', `Bearer ${authToken}`);

    // Intentamos marcarlo de nuevo el mismo día
    const res2 = await request(app)
      .post(`/api/habits/${habitId}/check`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res2.status).toBe(400);
    expect(res2.body.message).toBe('Ya has marcado este hábito hoy');
  });

  it('debe devolver 200 con date y currentStreak correcto', async () => {
    // Creamos y marcamos
    const habit = await createHabit(userId, { name: 'hacer ejercicio' });
    habitId = habit.id;

    const res = await request(app)
      .post(`/api/habits/${habitId}/check`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('habitId', habitId);
    expect(res.body).toHaveProperty('date');
    expect(res.body).toHaveProperty('currentStreak', 1);
  });
});
