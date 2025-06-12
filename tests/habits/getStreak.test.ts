import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { createHabit, habitStore } from '../../src/services/habit.service';
import { markHabit } from '../../src/services/habit.service';
import jwt from 'jsonwebtoken';

describe('C06: GET /api/habits/:habitId/streak', () => {
  let authToken: string;
  let userId: string;
  let habitId: string;

  beforeAll(async () => {
    const user = await createUser('streak@test.com', 'secret123');
    userId = user.id;
    authToken = jwt.sign(
      { sub: userId, email: 'streak@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
  });

  beforeEach(() => {
    const habit = createHabit(userId, 'leer diario');
    habitId = habit.id;
  });

  afterEach(() => {
    habitStore.clear();
  });

  it('debe devolver 401 si falta token', async () => {
    const res = await request(app).get(`/api/habits/${habitId}/streak`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    habitStore.clear();
    const res = await request(app)
      .get(`/api/habits/no-existe-uuid/streak`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 403 si hábito de otro usuario', async () => {
    // Crear otro usuario y token
    const other = await createUser('otro@test.com', 'secret123');
    const otherToken = jwt.sign(
      { sub: other.id, email: 'otro@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .get(`/api/habits/${habitId}/streak`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('No autorizado');
  });

  it('debe devolver 0 si no hay checks', async () => {
    const res = await request(app)
      .get(`/api/habits/${habitId}/streak`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ habitId, currentStreak: 0 });
  });

  it('debe devolver racha=1 tras un check', async () => {
    // marcamos hoy
    markHabit(userId, habitId);

    const res = await request(app)
      .get(`/api/habits/${habitId}/streak`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        habitId,
        currentStreak: 1,
        lastCheck: expect.any(String),
      }),
    );
  });
});
