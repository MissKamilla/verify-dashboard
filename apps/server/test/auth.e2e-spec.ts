import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import {
  cleanupUploads,
  createE2eApp,
  registerUser,
  resetE2eState,
} from './e2e-utils';
import { AuthResponseBody, ValidationErrorResponseBody } from './e2e-types';

describe('Auth integration', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const e2eApp = await createE2eApp();

    app = e2eApp.app;
    dataSource = e2eApp.dataSource;
  });

  beforeEach(async () => {
    await resetE2eState(dataSource);
  });

  afterAll(async () => {
    await cleanupUploads();

    await app?.close();
  });

  it('registers a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(201);

    const responseBody = response.body as AuthResponseBody;

    expect(responseBody.token).toEqual(expect.any(String));
  });

  it('logs in registered user', async () => {
    await registerUser(app);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(200);

    const responseBody = response.body as AuthResponseBody;

    expect(responseBody.token).toEqual(expect.any(String));
  });

  it('rejects invalid registration form', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'A',
        lastname: 'Smith2',
        email: 'invalid-email',
        password: 'short',
      })
      .expect(400);

    const responseBody =
      response.body as unknown as ValidationErrorResponseBody;

    expect(responseBody.statusCode).toBe(400);

    expect(Array.isArray(responseBody.message)).toBe(true);

    expect(responseBody.message.length).toBeGreaterThan(0);
  });
});
