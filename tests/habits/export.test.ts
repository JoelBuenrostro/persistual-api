import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { createHabit, checkStore } from '../../src/services/habit.service';

describe('GET /api/habits/export', () => {
  let token: string;
  let habitId: string;

  beforeAll(async () => {
    const email = 'export@test.com';
    const password = 'secret123';
    const user = await createUser(email, password);
    habitId = (await createHabit(user.id, { name: 'Leer' })).id;
    checkStore.set(habitId, ['2025-08-01', '2025-08-02']);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    token = loginRes.body.accessToken;
  });

  it('requiere token, responde 401 sin auth', async () => {
    const res = await request(app).get('/api/habits/export');
    expect(res.status).toBe(401);
  });

  it('devuelve CSV con los checks', async () => {
    const res = await request(app)
      .get('/api/habits/export?format=csv')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('habitId,name,date,checked');
    expect(res.text).toContain('Leer');
    expect(res.text).toContain('2025-08-01');
    expect(res.text).toContain('2025-08-02');
  });

  it('devuelve Excel si se pide xlsx', async () => {
    const res = await request(app)
      .get('/api/habits/export?format=xlsx')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.body).toBeInstanceOf(Buffer);
  });
});
