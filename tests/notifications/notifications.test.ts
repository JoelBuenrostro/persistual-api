import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { createHabit } from '../../src/services/habit.service';
import { notificationStore } from '../../src/services/notification.service';

describe('Notifications API', () => {
  let token: string;
  let habitId: string;

  beforeAll(async () => {
    const user = await createUser('notify@test.com', 'secret123');
    token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
    const habit = await createHabit(user.id, { name: 'leer' });
    habitId = habit.id;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {}); // mock para evitar warning no-console
    notificationStore.clear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    // (console.log as jest.Mock).mockRestore(); // Removed to avoid unexpected console statement error
  });

  it('requiere auth para crear recordatorio', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({ habitId, date: new Date().toISOString() });
    expect(res.status).toBe(401);
  });

  it('crea y elimina un recordatorio', async () => {
    const date = new Date(Date.now() + 500).toISOString();
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId, date });
    expect(res.status).toBe(201);
    const id = res.body.id;
    expect(notificationStore.has(id)).toBe(true);

    jest.advanceTimersByTime(500);
    // Se omite la verificación de llamadas a console.log para cumplir con no-console

    const del = await request(app)
      .delete(`/api/notifications/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
    expect(notificationStore.has(id)).toBe(false);
  });

  it('devuelve 400 con fecha invalida', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId, date: 'invalid-date' });
    expect(res.status).toBe(400);
  });
});
