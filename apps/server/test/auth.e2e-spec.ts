import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import {
  cleanupUploads,
  createE2eApp,
  registerUser,
  resetE2eState,
  sentVerificationCodes,
} from './e2e-utils';
import {
  AuthResponseBody,
  ErrorResponseBody,
  RegisterResponseBody,
  ValidationErrorResponseBody,
} from './e2e-types';

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

    const responseBody = response.body as RegisterResponseBody;

    expect(responseBody).toEqual({
      message: 'Verification code sent',
    });

    expect(sentVerificationCodes.get('anna@test.com')).toEqual(
      expect.stringMatching(/^\d{6}$/),
    );
  });

  it('verifies registered user email and returns token', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(201);

    const verificationCode = sentVerificationCodes.get('anna@test.com');

    expect(verificationCode).toEqual(expect.stringMatching(/^\d{6}$/));

    const response = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({
        email: 'anna@test.com',
        code: verificationCode,
      })
      .expect(200);

    const responseBody = response.body as AuthResponseBody;

    expect(responseBody.token).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(200);
  });

  it('rejects login before email is verified', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(403);

    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.message).toBe('Email is not verified');
  });

  it('rejects invalid verification code', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({
        email: 'anna@test.com',
        code: '000000',
      })
      .expect(400);

    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.message).toBe('Invalid verification code');
  });

  it('resends verification code for unverified user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/resend-verification')
      .send({
        email: 'anna@test.com',
      })
      .expect(200);

    const responseBody = response.body as RegisterResponseBody;

    expect(responseBody).toEqual({
      message: 'Verification code sent',
    });

    expect(sentVerificationCodes.get('anna@test.com')).toEqual(
      expect.stringMatching(/^\d{6}$/),
    );
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
