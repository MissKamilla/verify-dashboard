import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';

type AuthResponseBody = {
  token: string;
};

type ProfileResponseBody = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
};

type GalleryResponseBody = {
  id: number;
  title: string;
  description: string;
  userId: number;
  createdAt: string;
};

type ValidationErrorResponseBody = {
  statusCode: number;
  message: string[];
};

type RegisterUserPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

type CreateGalleryPayload = {
  title: string;
  description: string;
};

type GalleryListItemResponseBody = GalleryResponseBody & {
  photosCount: number;
  previewImages: {
    id: number;
    path: string;
  }[];
};

type GalleriesListResponseBody = {
  items: GalleryListItemResponseBody[];
  total: number;
  page: number;
  limit: number;
};

type ErrorResponseBody = {
  statusCode: number;
  message: string;
};

describe('App integration', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const registerUser = async (
    overrides: Partial<RegisterUserPayload> = {},
  ): Promise<string> => {
    const payload: RegisterUserPayload = {
      firstname: 'Anna',
      lastname: 'Smith',
      email: 'anna@test.com',
      password: 'Password123',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    const responseBody = response.body as unknown as AuthResponseBody;

    return responseBody.token;
  };

  const createGallery = async (
    token: string,
    overrides: Partial<CreateGalleryPayload> = {},
  ): Promise<GalleryResponseBody> => {
    const payload: CreateGalleryPayload = {
      title: 'Nature',
      description: 'Summer photos',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post('/galleries')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    return response.body as GalleryResponseBody;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(`
      TRUNCATE TABLE "images", "galleries", "users"
      RESTART IDENTITY CASCADE;
    `);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AppController', () => {
    it('/ (GET)', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Auth', () => {
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
      await registerUser();

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

  describe('Users', () => {
    it('rejects protected request without token', async () => {
      await request(app.getHttpServer()).get('/users/profile').expect(401);
    });

    it('updates current user profile', async () => {
      const token = await registerUser();

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

  describe('Galleries', () => {
    it('rejects galleries request without token', async () => {
      await request(app.getHttpServer()).get('/galleries').expect(401);
    });

    it('creates and updates gallery', async () => {
      const token = await registerUser();

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
      const token = await registerUser();

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
      const token = await registerUser();

      await createGallery(token, {
        title: 'Nature',
        description: 'Summer photos',
      });

      await createGallery(token, {
        title: 'Travel',
        description: 'Trip photos',
      });

      const response = await request(app.getHttpServer())
        .get('/galleries')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const responseBody =
        response.body as unknown as GalleriesListResponseBody;

      expect(responseBody.total).toBe(2);

      expect(responseBody.page).toBe(1);

      expect(responseBody.limit).toBe(10);

      expect(responseBody.items).toHaveLength(2);

      expect(responseBody.items.map((gallery) => gallery.title).sort()).toEqual(
        ['Nature', 'Travel'],
      );

      expect(
        responseBody.items.every((gallery) => gallery.photosCount === 0),
      ).toBe(true);

      expect(
        responseBody.items.every(
          (gallery) => gallery.previewImages.length === 0,
        ),
      ).toBe(true);
    });

    it('returns gallery by id', async () => {
      const token = await registerUser();

      const createdGallery = await createGallery(token);

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
      const firstUserToken = await registerUser();

      const secondUserToken = await registerUser({
        firstname: 'Bob',
        lastname: 'Brown',
        email: 'bob@test.com',
      });

      const firstUserGallery = await createGallery(firstUserToken);

      await request(app.getHttpServer())
        .get(`/galleries/${firstUserGallery.id}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(404);

      const response = await request(app.getHttpServer())
        .get('/galleries')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      const responseBody =
        response.body as unknown as GalleriesListResponseBody;

      expect(responseBody.items).toEqual([]);

      expect(responseBody.total).toBe(0);
    });

    it('filters galleries by search query', async () => {
      const token = await registerUser();

      await createGallery(token, {
        title: 'Nature',
      });

      await createGallery(token, {
        title: 'Travel',
      });

      await createGallery(token, {
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
      const token = await registerUser();

      await createGallery(token, {
        title: 'Zebra',
      });

      await createGallery(token, {
        title: 'Alpha',
      });

      await createGallery(token, {
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
      const token = await registerUser();

      const createdGallery = await createGallery(token);

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
      const token = await registerUser();

      await createGallery(token, {
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

      expect(responseBody.message).toBe(
        'Gallery with this title already exists',
      );
    });

    it('rejects gallery update when another gallery already has requested title', async () => {
      const token = await registerUser();

      await createGallery(token, {
        title: 'Nature',
      });

      const travelGallery = await createGallery(token, {
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

      expect(responseBody.message).toBe(
        'Gallery with this title already exists',
      );

      const unchangedGalleryResponse = await request(app.getHttpServer())
        .get(`/galleries/${travelGallery.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const unchangedGallery =
        unchangedGalleryResponse.body as GalleryResponseBody;

      expect(unchangedGallery.title).toBe('Travel');
    });

    it('does not allow another user to update or delete gallery', async () => {
      const ownerToken = await registerUser();

      const anotherUserToken = await registerUser({
        firstname: 'Bob',
        lastname: 'Brown',
        email: 'bob@test.com',
      });

      const gallery = await createGallery(ownerToken);

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
  });
});
