import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';
import { authenticateUser } from '../../src/services/auth.service';
import { createHabit } from '../../src/services/habit.service';

describe('C03: PUT /api/habits/:habitId', () => {
  let userId: string;
  let authToken: string;
  let anotherToken: string;
  let habitId: string;

  beforeAll(async () => {
    // Creamos dos usuarios
    const user = await createUser('user@test.com', 'secret123');
    userId = user.id;
    const tokens = await authenticateUser('user@test.com', 'secret123');
    authToken = tokens.accessToken;

    const _other = await createUser('other@test.com', 'secret123');
    const otherTokens = await authenticateUser('other@test.com', 'secret123');
    anotherToken = otherTokens.accessToken;

    // Creamos un hábito para el primer usuario
    const habit = await createHabit(userId, {
      name: 'leer diario',
      description: 'Descripción inicial',
    });
    habitId = habit.id;
  });

  it('debe devolver 401 si no se envía token', async () => {
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .send({ name: 'nuevo nombre' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido o expirado');
  });

  it('debe devolver 404 si el hábito no existe', async () => {
    const res = await request(app)
      .put(`/api/habits/nonexistent`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'nuevo nombre' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hábito no encontrado');
  });

  it('debe devolver 403 si el hábito no pertenece al usuario', async () => {
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
    const newData = { name: 'nuevo hábito', description: 'Nueva desc' };
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(newData);

    expect(res.status).toBe(200);
    const habit = res.body;
    expect(habit.id).toBe(habitId);
    expect(habit.userId).toBe(userId);
    expect(habit.name).toBe(newData.name);
    expect(habit.description).toBe(newData.description);
  });
});
