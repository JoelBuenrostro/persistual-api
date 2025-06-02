import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';

describe('POST /api/auth/login', () => {
  const user = { email: 'test@user.com', password: 'secret123' };

  beforeAll(async () => {
    // Asegura que existe el usuario
    await createUser(user.email, user.password);
  });

  it('debe responder 200 con access y refresh token', async () => {
    const res = await request(app).post('/api/auth/login').send(user);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('debe devolver 400 si el email es inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-valido', password: 'secret123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('El email no es válido');
  });

  it('debe devolver 401 si usuario no existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no@existe.com', password: 'cualquiera' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email o contraseña inválida');
  });

  it('debe devolver 401 si la contraseña es incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email o contraseña inválida');
  });
});
