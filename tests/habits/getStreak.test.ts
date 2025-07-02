import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { authenticateUser } from '../../src/services/auth.service';
import { createHabit, checkHabit } from '../../src/services/habit.service';

describe('C06: GET /api/habits/:habitId/streak', () => {
  const user = { email: 'suser@test.com', password: 'secret123' };
  let authToken: string;
  let userId: string;
  let habitId: string;

  beforeAll(async () => {
    // Crear usuario y obtener token
    await createUser(user.email, user.password);
    authToken = (await authenticateUser(user.email, user.password)).accessToken;
    const payload = jwt.verify(
      authToken,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    userId = payload.sub as string;

    // Crear hábito inicial
    const habit = await createHabit(userId, {
      name: 'hacer ejercicio',
      description: 'Descripción',
    });
    habitId = habit.id;
  });

  it('debe devolver 401 si falta token', async () => {
    const res = await request(app).get(`/api/habits/${habitId}/streak`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    const res = await request(app)
      .get(`/api/habits/nonexistent/streak`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 403 si hábito de otro usuario', async () => {
    // Creamos otro usuario
    await createUser('otro@test.com', 'secret123');
    const otherToken = (await authenticateUser('otro@test.com', 'secret123'))
      .accessToken;

    const res = await request(app)
      .get(`/api/habits/${habitId}/streak`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('No autorizado');
  });

  it('debe devolver racha=0 si no hay checks', async () => {
    const res = await request(app)
      .get(`/api/habits/${habitId}/streak`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ habitId, currentStreak: 0 });
  });

  it('debe devolver racha=1 tras un check', async () => {
    // Marcamos el hábito hoy
    await checkHabit(habitId, userId);

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
