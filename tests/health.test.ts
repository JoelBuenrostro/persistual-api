import request from 'supertest';
import app from '../src/index';

describe('GET /healthz', () => {
  it('debe responder 200 OK', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
  });
});
