import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { authenticateUser } from '../../src/services/auth.service';
import { createHabit } from '../../src/services/habit.service';
import { Habit } from '../../src/models/Habits';

describe('C02: GET /api/habits', () => {
  const user = { email: 'user@test.com', password: 'secret123' };
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await createUser(user.email, user.password);
    authToken = (await authenticateUser(user.email, user.password)).accessToken;
    const payload = jwt.verify(
      authToken,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    userId = payload.sub as string;
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).get('/api/habits');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver [] si el usuario no tiene hábitos', async () => {
    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect((res.body as Habit[]).length).toBe(0);
  });

  it('debe devolver una lista de hábitos para el usuario', async () => {
    // crear dos hábitos para este usuario
    await createHabit(userId, {
      name: 'leer 30 minutos',
      description: 'Leer diario',
    });
    await createHabit(userId, {
      name: 'meditar 10 min',
    });

    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const habits = res.body as Habit[];
    expect(habits.some(h => h.name === 'leer 30 minutos')).toBe(true);
    expect(habits.some(h => h.name === 'meditar 10 min')).toBe(true);
  });
});
