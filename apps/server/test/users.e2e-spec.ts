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
import { ProfileResponseBody } from './e2e-types';

describe('Users integration', () => {
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

  it('rejects protected request without token', async () => {
    await request(app.getHttpServer()).get('/users/profile').expect(401);
  });

  it('updates current user profile', async () => {
    const token = await registerUser(app);

    const response = await request(app.getHttpServer())
      .patch('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Kate',
        lastname: 'Brown',
        email: 'kate@test.com',
      })
      .expect(200);

    const responseBody = response.body as ProfileResponseBody;

    expect(responseBody).toEqual(
      expect.objectContaining({
        id: 1,
        firstname: 'Kate',
        lastname: 'Brown',
        email: 'kate@test.com',
      }),
    );
  });
});
