// tests/habits/createHabit.test.ts

import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import jwt from 'jsonwebtoken';

describe('C01: POST /api/habits', () => {
  let authToken: string;
  const user = { email: 'habituser@test.com', password: 'secret123' };

  beforeAll(async () => {
    // 1. Crear un usuario para poder obtener token
    const created = await createUser(user.email, user.password);
    // 2. Generar JWT “en frío” (desde código) para usar en tests
    authToken = jwt.sign(
      { sub: created.id, email: created.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).post('/api/habits').send({
      name: 'leer 30 min',
      description: 'Describir algo',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe crear hábito y devolver 201 con el objeto', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'leer 30 minutos',
        description: 'Leer cada día antes de dormir',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBeDefined();
    expect(res.body.name).toBe('leer 30 minutos');
    expect(res.body.description).toBe('Leer cada día antes de dormir');
    expect(res.body).toHaveProperty('createdAt');
  });

  it('debe devolver 400 si name tiene menos de 3 caracteres', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'aa',
        description: 'Cualquier cosa',
      });

    expect(res.status).toBe(400);
    // Debería contener el mensaje que definimos en @MinLength de CreateHabitDTO
    expect(res.body.errors).toContain(
      'El nombre debe tener al menos 3 caracteres',
    );
  });
});
