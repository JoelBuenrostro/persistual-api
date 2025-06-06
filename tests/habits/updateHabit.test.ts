import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { createHabit, habitStore } from '../../src/services/habit.service';
import jwt from 'jsonwebtoken';
import { Habit } from '../../src/models/Habits';

describe('C03: PUT /api/habits/:habitId', () => {
  let authToken: string;
  let userId: string;
  let anotherToken: string;
  let habitId: string;

  beforeAll(async () => {
    // 1. Crear usuario A y token
    const userA = await createUser('userA@test.com', 'secret123');
    userId = userA.id;
    authToken = jwt.sign(
      { sub: userId, email: 'userA@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    // 2. Crear usuario B y token (para probar 403)
    const userB = await createUser('userB@test.com', 'secret123');
    anotherToken = jwt.sign(
      { sub: userB.id, email: 'userB@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
  });

  beforeEach(() => {
    // Cada prueba necesita un hábito “limpio” en memoria para userA
    const habit = createHabit(userId, 'leer diario', 'Descripción inicial');
    habitId = habit.id;
  });

  afterEach(() => {
    // Limpiamos todos los hábitos para que la siguiente prueba empiece de cero
    habitStore.clear();
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .send({ name: 'nuevo nombre' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    // Eliminamos el hábito antes de invocar el endpoint para simular “no existe”
    habitStore.clear();

    const fakeId = 'no-existe-uuid';
    const res = await request(app)
      .put(`/api/habits/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'cualquier cosa' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 403 si el hábito no pertenece al usuario', async () => {
    // En este punto, beforeEach ya creó un hábito para userA con id=habitId.
    // UserB intenta actualizarlo:
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send({ name: 'atento a 403' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('No autorizado');
  });

  it('debe devolver 400 si el nombre es muy corto', async () => {
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'aa' }); // menos de 3 caracteres

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain(
      'El nombre debe tener al menos 3 caracteres',
    );
  });

  it('debe actualizar el hábito y devolver 200 con el objeto actualizado', async () => {
    const newData = {
      name: 'leer 45 min',
      description: 'Actualizar descripción',
    };
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(newData);

    expect(res.status).toBe(200);
    const habit: Habit = res.body;
    expect(habit.id).toBe(habitId);
    expect(habit.userId).toBe(userId);
    expect(habit.name).toBe('leer 45 min');
    expect(habit.description).toBe('Actualizar descripción');
    expect(typeof habit.createdAt).toBe('string');
  });
});
