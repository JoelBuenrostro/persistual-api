import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { authenticateUser } from '../../src/services/auth.service';
import { createHabit } from '../../src/services/habit.service';

describe('C04: DELETE /api/habits/:habitId', () => {
  const user = { email: 'user@test.com', password: 'secret123' };
  const otherUser = { email: 'other@test.com', password: 'secret456' };
  let habitId: string;
  let authToken: string;
  let otherToken: string;

  beforeAll(async () => {
    await createUser(user.email, user.password);
    await createUser(otherUser.email, otherUser.password);

    authToken = (await authenticateUser(user.email, user.password)).accessToken;
    otherToken = (await authenticateUser(otherUser.email, otherUser.password))
      .accessToken;

    const payload = jwt.verify(
      authToken,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    const userId = payload.sub as string;

    // <-- Aquí corregimos a dos argumentos, pasando un DTO
    const habit = await createHabit(userId, {
      name: 'hacer ejercicio',
      description: 'Descripción',
    });
    habitId = habit.id;
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).delete(`/api/habits/${habitId}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .delete(`/api/habits/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 403 si el hábito pertenece a otro usuario', async () => {
    const res = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('No autorizado');
  });

  it('debe devolver 204 al eliminar correctamente', async () => {
    const res = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(204);

    const res2 = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual([]);
  });
});
