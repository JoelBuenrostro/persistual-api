import request from 'supertest';
import app from '../../src/index';
import { createUser } from '../../src/services/user.service';

describe('CRUD de Categorías (/api/categories)', () => {
  let token: string;
  let categoryId: string;

  beforeAll(async () => {
    // 1) Crea un usuario de prueba
    const email = 'cat@test.com';
    const password = 'secret123';
    await createUser(email, password);

    // 2) Haz login para obtener el accessToken
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    token = res.body.accessToken;
  });

  it('POST /api/categories → 201 y objeto categoría', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salud' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Salud');
    categoryId = res.body.id;
  });

  it('POST /api/categories → 400 si nombre muy corto', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'AB' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain(
      'El nombre debe tener al menos 3 caracteres',
    );
  });

  it('GET /api/categories → 200 y lista incluye la categoría creada', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Casteamos a un arreglo de objetos que al menos tienen id
    const categories = res.body as Array<{ id: string }>;
    expect(categories.some(c => c.id === categoryId)).toBe(true);
  });

  it('GET /api/categories/:id → 200 y devuelve la categoría correcta', async () => {
    const res = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(categoryId);
    expect(res.body.name).toBe('Salud');
  });

  it('GET /api/categories/:id → 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/categories/404-not-found')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Categoría no encontrada');
  });

  it('PUT /api/categories/:id → 200 y actualiza correctamente', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salud Mental' });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(categoryId);
    expect(res.body.name).toBe('Salud Mental');
  });

  it('PUT /api/categories/:id → 400 si nombre inválido', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain(
      'El nombre debe tener al menos 3 caracteres',
    );
  });

  it('DELETE /api/categories/:id → 204 elimina la categoría', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('DELETE /api/categories/:id → 404 si ya no existe', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Categoría no encontrada');
  });
});
