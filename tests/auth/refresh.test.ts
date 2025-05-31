import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { authenticateUser } from '../../src/services/auth.service';

describe('POST /api/auth/refresh', () => {
  const user = { email: 'ruser@test.com', password: 'secret123' };
  let refreshToken: string;

  beforeAll(async () => {
    // Asegura que el usuario ya existe
    await createUser(user.email, user.password);
    // Obtiene tokens iniciales (access + refresh)
    const tokens = await authenticateUser(user.email, user.password);
    refreshToken = tokens.refreshToken;
  });

  it('debe responder 200 con nuevo accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('debe devolver 401 si el token no coincide con el almacenado', async () => {
    // Modificamos ligeramente el refreshToken para que no coincida
    const invalidToken = refreshToken + 'x';
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: invalidToken });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 400 si no envía refreshToken en el body', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('refreshToken must be provided');
  });

  it('debe devolver 401 si el token está expirado', async () => {
    // Generamos un refreshToken expirado manualmente
    const expiredToken = jwt.sign(
      { sub: 'someuserid' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '-1m' }, // expirado hace 1 minuto
    );

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: expiredToken });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });
});
