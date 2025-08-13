import request from 'supertest';
import app from '../src/index';

describe('GET /healthz', () => {
  it('debe responder 200 OK y status ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('debe responder 404 en ruta inexistente', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
  });
});
