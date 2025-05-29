import request from 'supertest';
import app from '../../src/index';

describe('POST /api/auth/register', () => {
  it('debe crear usuario y devolver 201 con id y email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('user@example.com');
  });

  it('debe devolver 400 si email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-valido', password: 'secret123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('El email no es válido');
  });

  it('debe devolver 400 si email duplicado', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'secret123' });
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'secret123' });
    expect(res2.status).toBe(400);
    expect(res2.body.message).toBe('Email already in use');
  });
});
