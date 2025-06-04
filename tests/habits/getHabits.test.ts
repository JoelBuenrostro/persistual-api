import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { createHabit, habitStore } from '../../src/services/habit.service';
import jwt from 'jsonwebtoken';
import { Habit } from '../../src/models/Habits';

describe('C02: GET /api/habits', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // 1. Crear usuario de prueba
    const created = await createUser('huser@test.com', 'secret123');
    userId = created.id;

    // 2. Generar token JWT “en frío” para usar en los tests
    authToken = jwt.sign(
      { sub: userId, email: 'huser@test.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
  });

  afterEach(() => {
    // Limpiamos cualquier hábito creado para no contaminar otros tests
    habitStore.clear();
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).get('/api/habits');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver [] si el usuario no tiene hábitos', async () => {
    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect((res.body as Habit[]).length).toBe(0);
  });

  it('debe devolver una lista de hábitos para el usuario', async () => {
    // 1. Crear 2 hábitos directamente en el servicio
    createHabit(userId, 'leer 30 minutos', 'Leer diario');
    createHabit(userId, 'meditar 10 min');

    // 2. Llamar al endpoint
    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Convertimos body a tipo Habit[]
    const habits = res.body as Habit[];

    expect(habits.length).toBe(2);

    // Verifica campos de cada hábito
    const nombres = habits.map(h => h.name);
    expect(nombres).toContain('leer 30 minutos');
    expect(nombres).toContain('meditar 10 min');

    // Asegúrate de que cada objeto tiene id, userId, name, createdAt
    habits.forEach(h => {
      expect(typeof h.id).toBe('string');
      expect(h.userId).toBe(userId);
      expect(typeof h.name).toBe('string');
      expect(typeof h.createdAt).toBe('string');
    });
  });
});
