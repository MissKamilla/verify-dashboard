import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import {
  cleanupUploads,
  createE2eApp,
  createGallery,
  registerUser,
  resetE2eState,
} from './e2e-utils';
import {
  ErrorResponseBody,
  GalleriesListResponseBody,
  GalleryResponseBody,
  ValidationErrorResponseBody,
} from './e2e-types';

describe('Galleries integration', () => {
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

  it('rejects galleries request without token', async () => {
    await request(app.getHttpServer()).get('/galleries').expect(401);
  });

  it('creates and updates gallery', async () => {
    const token = await registerUser(app);

    const createResponse = await request(app.getHttpServer())
      .post('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Nature',
        description: 'Summer photos',
      })
      .expect(201);

    const createdGallery = createResponse.body as GalleryResponseBody;

    expect(createdGallery).toEqual(
      expect.objectContaining({
        id: 1,
        title: 'Nature',
        description: 'Summer photos',
        userId: 1,
      }),
    );

    expect(typeof createdGallery.createdAt).toBe('string');

    expect(Number.isNaN(Date.parse(createdGallery.createdAt))).toBe(false);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/galleries/${createdGallery.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Travel',
        description: 'Updated description',
      })
      .expect(200);

    const updatedGallery = updateResponse.body as GalleryResponseBody;

    expect(updatedGallery).toEqual(
      expect.objectContaining({
        id: createdGallery.id,
        title: 'Travel',
        description: 'Updated description',
        userId: 1,
      }),
    );
  });

  it('rejects invalid gallery form', async () => {
    const token = await registerUser(app);

    const response = await request(app.getHttpServer())
      .post('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'A',
        description: 'Invalid gallery',
      })
      .expect(400);

    const responseBody =
      response.body as unknown as ValidationErrorResponseBody;

    expect(responseBody.statusCode).toBe(400);

    expect(Array.isArray(responseBody.message)).toBe(true);

    expect(responseBody.message.length).toBeGreaterThan(0);
  });

  it('returns current user galleries list', async () => {
    const token = await registerUser(app);

    await createGallery(app, token, {
      title: 'Nature',
      description: 'Summer photos',
    });

    await createGallery(app, token, {
      title: 'Travel',
      description: 'Trip photos',
    });

    const response = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const responseBody = response.body as unknown as GalleriesListResponseBody;

    expect(responseBody.total).toBe(2);

    expect(responseBody.page).toBe(1);

    expect(responseBody.limit).toBe(10);

    expect(responseBody.items).toHaveLength(2);

    expect(responseBody.items.map((gallery) => gallery.title).sort()).toEqual([
      'Nature',
      'Travel',
    ]);

    expect(
      responseBody.items.every((gallery) => gallery.photosCount === 0),
    ).toBe(true);

    expect(
      responseBody.items.every((gallery) => gallery.previewImages.length === 0),
    ).toBe(true);
  });

  it('returns gallery by id', async () => {
    const token = await registerUser(app);

    const createdGallery = await createGallery(app, token);

    const response = await request(app.getHttpServer())
      .get(`/galleries/${createdGallery.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const responseBody = response.body as unknown as GalleryResponseBody;

    expect(responseBody.id).toBe(createdGallery.id);

    expect(responseBody.title).toBe('Nature');

    expect(responseBody.description).toBe('Summer photos');

    expect(responseBody.userId).toBe(1);

    expect(typeof responseBody.createdAt).toBe('string');

    expect(Number.isNaN(Date.parse(responseBody.createdAt))).toBe(false);
  });

  it('does not expose another user gallery', async () => {
    const firstUserToken = await registerUser(app);

    const secondUserToken = await registerUser(app, {
      firstname: 'Bob',
      lastname: 'Brown',
      email: 'bob@test.com',
    });

    const firstUserGallery = await createGallery(app, firstUserToken);

    await request(app.getHttpServer())
      .get(`/galleries/${firstUserGallery.id}`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .expect(404);

    const response = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${secondUserToken}`)
      .expect(200);

    const responseBody = response.body as unknown as GalleriesListResponseBody;

    expect(responseBody.items).toEqual([]);

    expect(responseBody.total).toBe(0);
  });

  it('filters galleries by search query', async () => {
    const token = await registerUser(app);

    await createGallery(app, token, {
      title: 'Nature',
    });

    await createGallery(app, token, {
      title: 'Travel',
    });

    await createGallery(app, token, {
      title: 'Portraits',
    });

    const response = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .query({
        search: '  VEL  ',
      })
      .expect(200);

    const responseBody = response.body as GalleriesListResponseBody;

    expect(responseBody.total).toBe(1);

    expect(responseBody.items).toHaveLength(1);

    expect(responseBody.items[0]?.title).toBe('Travel');
  });

  it('sorts galleries by title and returns requested page', async () => {
    const token = await registerUser(app);

    await createGallery(app, token, {
      title: 'Zebra',
    });

    await createGallery(app, token, {
      title: 'Alpha',
    });

    await createGallery(app, token, {
      title: 'Middle',
    });

    const response = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .query({
        sortBy: 'title',
        sortOrder: 'ASC',
        page: 2,
        limit: 2,
      })
      .expect(200);

    const responseBody = response.body as GalleriesListResponseBody;

    expect(responseBody.total).toBe(3);

    expect(responseBody.page).toBe(2);

    expect(responseBody.limit).toBe(2);

    expect(responseBody.items).toHaveLength(1);

    expect(responseBody.items[0]?.title).toBe('Zebra');
  });

  it('deletes gallery and returns 404 for subsequent request', async () => {
    const token = await registerUser(app);

    const createdGallery = await createGallery(app, token);

    await request(app.getHttpServer())
      .delete(`/galleries/${createdGallery.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/galleries/${createdGallery.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    const listResponse = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const listResponseBody = listResponse.body as GalleriesListResponseBody;

    expect(listResponseBody.items).toEqual([]);

    expect(listResponseBody.total).toBe(0);
  });

  it('rejects duplicate gallery title for the same user', async () => {
    const token = await registerUser(app);

    await createGallery(app, token, {
      title: 'Nature',
    });

    const response = await request(app.getHttpServer())
      .post('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Nature',
        description: 'Duplicate gallery',
      })
      .expect(409);

    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.statusCode).toBe(409);

    expect(responseBody.message).toBe('Gallery with this title already exists');
  });

  it('rejects gallery update when another gallery already has requested title', async () => {
    const token = await registerUser(app);

    await createGallery(app, token, {
      title: 'Nature',
    });

    const travelGallery = await createGallery(app, token, {
      title: 'Travel',
    });

    const response = await request(app.getHttpServer())
      .patch(`/galleries/${travelGallery.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Nature',
      })
      .expect(409);

    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.statusCode).toBe(409);

    expect(responseBody.message).toBe('Gallery with this title already exists');

    const unchangedGalleryResponse = await request(app.getHttpServer())
      .get(`/galleries/${travelGallery.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const unchangedGallery =
      unchangedGalleryResponse.body as GalleryResponseBody;

    expect(unchangedGallery.title).toBe('Travel');
  });

  it('does not allow another user to update or delete gallery', async () => {
    const ownerToken = await registerUser(app);

    const anotherUserToken = await registerUser(app, {
      firstname: 'Bob',
      lastname: 'Brown',
      email: 'bob@test.com',
    });

    const gallery = await createGallery(app, ownerToken);

    await request(app.getHttpServer())
      .patch(`/galleries/${gallery.id}`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({
        title: 'Stolen gallery',
      })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/galleries/${gallery.id}`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .expect(404);

    const ownerResponse = await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const ownerGallery = ownerResponse.body as GalleryResponseBody;

    expect(ownerGallery.title).toBe('Nature');
  });

  it('shares gallery with registered user using normalized email casing', async () => {
    const ownerToken = await registerUser(app);

    const targetToken = await registerUser(app, {
      firstname: 'Bob',
      lastname: 'Brown',
      email: 'bob@test.com',
    });

    const gallery = await createGallery(app, ownerToken, {
      title: 'Shared gallery',
    });

    await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}/access/recipient`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .query({
        email: ' Bob@Test.com ',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          registered: true,
        });
      });

    await request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/access`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: ' Bob@Test.com ',
        role: 'viewer',
        sendNotification: false,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          status: 'access_granted',
        });
      });

    const response = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${targetToken}`)
      .expect(200);

    const responseBody = response.body as unknown as GalleriesListResponseBody;

    expect(responseBody.total).toBe(1);
    expect(responseBody.items[0]).toEqual(
      expect.objectContaining({
        id: gallery.id,
        title: gallery.title,
        role: 'viewer',
      }),
    );
  });

  it('validates gallery access recipient email query', async () => {
    const ownerToken = await registerUser(app);
    const gallery = await createGallery(app, ownerToken);

    const missingEmailResponse = await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}/access/recipient`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(400);

    const missingEmailBody =
      missingEmailResponse.body as unknown as ValidationErrorResponseBody;

    expect(missingEmailBody.message).toContain('email must be an email');

    const invalidEmailResponse = await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}/access/recipient`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .query({
        email: 'not-an-email',
      })
      .expect(400);

    const invalidEmailBody =
      invalidEmailResponse.body as unknown as ValidationErrorResponseBody;

    expect(invalidEmailBody.message).toContain('email must be an email');
  });
});
