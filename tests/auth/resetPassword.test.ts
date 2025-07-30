import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/index';
import { resetTokenStore } from '../../src/services/auth.service';
import { createUser } from '../../src/services/user.service';

describe('POST /api/auth/forgot', () => {
  it('debe responder 200 aunque el email no exista', async () => {
    const res = await request(app)
      .post('/api/auth/forgot')
      .send({ email: 'noexiste@test.com' });
    expect(res.status).toBe(200);
  });

  it('debe generar un token para un email válido', async () => {
    const email = 'user@test.com';
    await createUser(email, 'password123');
    const res = await request(app).post('/api/auth/forgot').send({ email });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/auth/reset', () => {
  it('debe devolver 400 si el token es inválido', async () => {
    const res = await request(app)
      .post('/api/auth/reset')
      .send({ token: 'invalid', newPassword: 'newpass123' });
    expect(res.status).toBe(400);
  });

  it('debe actualizar la contraseña con un token válido', async () => {
    const email = 'user@test.com';
    const user = await createUser(email, 'password123');
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });
    resetTokenStore.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    const res = await request(app)
      .post('/api/auth/reset')
      .send({ token, newPassword: 'newpass123' });
    expect(res.status).toBe(200);
  });
});
