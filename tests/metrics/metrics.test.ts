import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { authenticateUser } from '../../src/services/auth.service';
import {
  createHabit,
  habitStore,
  checkStore,
} from '../../src/services/habit.service'; // <-- habitStore y checkStore exportados

describe('GET /api/metrics', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await createUser('metrics@test.com', 'secret123');
    const tokens = await authenticateUser('metrics@test.com', 'secret123');
    accessToken = tokens.accessToken;
    const payload = jwt.decode(accessToken) as jwt.JwtPayload;
    userId = payload.sub as string;
  });

  beforeEach(() => {
    habitStore.clear();
    checkStore.clear();
  });

  it('sin token → 401', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('usuario sin datos → ceros', async () => {
    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalHabits: 0,
      totalChecks: 0,
      longestStreak: 0,
    });
  });

  it('estadísticas correctas tras hábitos y checks', async () => {
    // Creo dos hábitos
    const h1 = await createHabit(userId, { name: 'A' });
    const h2 = await createHabit(userId, { name: 'B' });
    // Pre-populo dos fechas distintas para h1 y una para h2
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    checkStore.set(h1.id, [yesterday, today]);
    checkStore.set(h2.id, [today]);

    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalHabits: 2,
      totalChecks: 3,
      longestStreak: 2,
    });
  });
});
