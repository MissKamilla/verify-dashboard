import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import {
  cleanupUploads,
  createGallery,
  createE2eApp,
  registerUser,
  resetE2eState,
  sentGalleryInvitations,
  sentVerificationCodes,
} from './e2e-utils';
import {
  AuthResponseBody,
  ErrorResponseBody,
  GalleryAccessListItemResponseBody,
  GalleriesListResponseBody,
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

  it('resends verification code when unverified user registers again', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          message: 'Verification code sent',
        });
      });

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
  });

  it('verifies and resends using normalized email casing', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Anna',
        lastname: 'Smith',
        email: '  Anna@Test.com  ',
        password: 'Password123',
      })
      .expect(201);

    const verificationCode = sentVerificationCodes.get('anna@test.com');

    expect(verificationCode).toEqual(expect.stringMatching(/^\d{6}$/));

    await request(app.getHttpServer())
      .post('/auth/resend-verification')
      .send({
        email: ' ANNA@Test.com ',
      })
      .expect(200);

    const resentVerificationCode = sentVerificationCodes.get('anna@test.com');

    expect(resentVerificationCode).toEqual(expect.stringMatching(/^\d{6}$/));

    const response = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({
        email: ' ANNA@Test.com ',
        code: resentVerificationCode,
      })
      .expect(200);

    const responseBody = response.body as AuthResponseBody;

    expect(responseBody.token).toEqual(expect.any(String));
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

  it('grants pending invitation access when regular registration is verified', async () => {
    const ownerToken = await registerUser(app);

    const gallery = await createGallery(app, ownerToken, {
      title: 'Shared gallery',
      description: 'Invite-only photos',
    });

    await request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/access`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'invitee@test.com',
        role: 'viewer',
        sendNotification: true,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          status: 'invitation_sent',
        });
      });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstname: 'Ivan',
        lastname: 'Invitee',
        email: 'invitee@test.com',
        password: 'Password123',
      })
      .expect(201);

    const verificationCode = sentVerificationCodes.get('invitee@test.com');

    expect(verificationCode).toEqual(expect.stringMatching(/^\d{6}$/));

    const verifyResponse = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({
        email: 'invitee@test.com',
        code: verificationCode,
      })
      .expect(200);

    const verifyBody = verifyResponse.body as AuthResponseBody;

    const galleriesResponse = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${verifyBody.token}`)
      .expect(200);

    const galleriesBody =
      galleriesResponse.body as unknown as GalleriesListResponseBody;

    expect(galleriesBody.total).toBe(1);
    expect(galleriesBody.items[0]).toEqual(
      expect.objectContaining({
        id: gallery.id,
        title: gallery.title,
        role: 'viewer',
      }),
    );

    const remainingInvitations = await dataSource.query<
      Array<{ count: number }>
    >(
      'SELECT COUNT(*)::int AS count FROM "gallery_invitations" WHERE "email" = $1',
      ['invitee@test.com'],
    );

    expect(remainingInvitations[0]?.count).toBe(0);
  });

  it('registers invited user with verified email and gallery access', async () => {
    const ownerToken = await registerUser(app);

    const gallery = await createGallery(app, ownerToken, {
      title: 'Shared gallery',
      description: 'Invite-only photos',
    });
    const secondGallery = await createGallery(app, ownerToken, {
      title: 'Second shared gallery',
      description: 'More invite-only photos',
    });

    await request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/access`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'invitee@test.com',
        role: 'viewer',
        sendNotification: true,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          status: 'invitation_sent',
        });
      });

    await request(app.getHttpServer())
      .post(`/galleries/${secondGallery.id}/access`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'invitee@test.com',
        role: 'editor',
        sendNotification: true,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          status: 'invitation_sent',
        });
      });

    const invitationToken = sentGalleryInvitations.get('invitee@test.com');

    expect(invitationToken).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));

    await request(app.getHttpServer())
      .get(`/auth/invitations/${invitationToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          email: 'invitee@test.com',
          galleryTitle: secondGallery.title,
          role: 'editor',
        });
      });

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register-by-invite')
      .send({
        firstname: 'Ivan',
        lastname: 'Invitee',
        password: 'Password123',
        token: invitationToken,
      })
      .expect(201);

    const registerBody = registerResponse.body as AuthResponseBody;

    expect(registerBody.token).toEqual(expect.any(String));

    const galleriesResponse = await request(app.getHttpServer())
      .get('/galleries')
      .set('Authorization', `Bearer ${registerBody.token}`)
      .expect(200);

    const galleriesBody =
      galleriesResponse.body as unknown as GalleriesListResponseBody;

    expect(galleriesBody.total).toBe(2);

    expect(galleriesBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: gallery.id,
          title: gallery.title,
          role: 'viewer',
        }),
        expect.objectContaining({
          id: secondGallery.id,
          title: secondGallery.title,
          role: 'editor',
        }),
      ]),
    );

    const remainingInvitations = await dataSource.query<
      Array<{ count: number }>
    >(
      'SELECT COUNT(*)::int AS count FROM "gallery_invitations" WHERE "email" = $1',
      ['invitee@test.com'],
    );

    expect(remainingInvitations[0]?.count).toBe(0);

    const galleryAccessResponse = await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}/access`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const galleryAccessBody =
      galleryAccessResponse.body as unknown as GalleryAccessListItemResponseBody[];

    const galleryInviteeAccess = galleryAccessBody.find(
      (access) =>
        access.status === 'active' && access.user.email === 'invitee@test.com',
    );

    expect(galleryInviteeAccess).toEqual(
      expect.objectContaining({
        status: 'active',
        role: 'viewer',
      }),
    );
    expect(
      galleryAccessBody.some(
        (access) =>
          access.status === 'pending' && access.email === 'invitee@test.com',
      ),
    ).toBe(false);

    const secondGalleryAccessResponse = await request(app.getHttpServer())
      .get(`/galleries/${secondGallery.id}/access`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const secondGalleryAccessBody =
      secondGalleryAccessResponse.body as unknown as GalleryAccessListItemResponseBody[];

    const secondGalleryInviteeAccess = secondGalleryAccessBody.find(
      (access) =>
        access.status === 'active' && access.user.email === 'invitee@test.com',
    );

    expect(secondGalleryInviteeAccess).toEqual(
      expect.objectContaining({
        status: 'active',
        role: 'editor',
      }),
    );
    expect(
      secondGalleryAccessBody.some(
        (access) =>
          access.status === 'pending' && access.email === 'invitee@test.com',
      ),
    ).toBe(false);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'invitee@test.com',
        password: 'Password123',
      })
      .expect(200);

    const expiredInvitationResponse = await request(app.getHttpServer())
      .get(`/auth/invitations/${invitationToken}`)
      .expect(400);

    const responseBody = expiredInvitationResponse.body as ErrorResponseBody;

    expect(responseBody.message).toBe('Invalid invitation');
  });

  it('rejects invalid invite registration form', async () => {
    const ownerToken = await registerUser(app);

    const gallery = await createGallery(app, ownerToken, {
      title: 'Shared gallery',
      description: 'Invite-only photos',
    });

    await request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/access`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'invitee@test.com',
        role: 'viewer',
        sendNotification: true,
      })
      .expect(201);

    const invitationToken = sentGalleryInvitations.get('invitee@test.com');

    expect(invitationToken).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));

    const response = await request(app.getHttpServer())
      .post('/auth/register-by-invite')
      .send({
        firstname: 'I1',
        lastname: 'A',
        password: 'password',
        token: invitationToken,
      })
      .expect(400);

    const responseBody =
      response.body as unknown as ValidationErrorResponseBody;

    expect(responseBody.statusCode).toBe(400);
    expect(Array.isArray(responseBody.message)).toBe(true);
    expect(responseBody.message.length).toBeGreaterThan(0);
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
