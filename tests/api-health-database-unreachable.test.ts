import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createTestDatabase } from './helpers/test-database.js';

/**
 * The database is down, but the liveness endpoint must stay up: if /api/health
 * touched the database, a brief database outage would take the whole service
 * out of the load balancer.
 */
describe('GET /api/health with the database unreachable', () => {
  it('still reports status as ok', async () => {
    const database = createTestDatabase();
    const app = createApp({ database });

    await database.stop();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });

    await database.cleanup();
  });
});
