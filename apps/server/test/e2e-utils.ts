import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { UPLOAD_IMAGES_FIELD_NAME } from '../src/images/images.constants';
import { MailService } from '../src/mail/mail.service';
import {
  AuthResponseBody,
  CreateGalleryPayload,
  GalleryResponseBody,
  ImageResponseBody,
  ImagesListResponseBody,
  RegisterUserPayload,
} from './e2e-types';

export const sentVerificationCodes = new Map<string, string>();
export const sentGalleryInvitations = new Map<string, string>();

export const uploadImagesDir = join(
  process.cwd(),
  process.env.UPLOAD_IMAGES_DIR ?? 'uploads/test-images',
);

export async function createE2eApp(): Promise<{
  app: INestApplication<App>;
  dataSource: DataSource;
}> {
  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  moduleBuilder.overrideProvider(MailService).useValue({
    sendVerificationCode: jest.fn((to: string, code: string) => {
      sentVerificationCodes.set(to, code);

      return Promise.resolve();
    }),
    sendGallerySharedNotification: jest.fn(() => Promise.resolve()),
    sendGalleryInvitation: jest.fn(
      (to: string, _title: string, token: string) => {
        sentGalleryInvitations.set(to, token);

        return Promise.resolve();
      },
    ),
  });

  const moduleFixture: TestingModule = await moduleBuilder.compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();

  return {
    app,
    dataSource: app.get<DataSource>(DataSource),
  };
}

export async function resetE2eState(dataSource: DataSource): Promise<void> {
  sentVerificationCodes.clear();
  sentGalleryInvitations.clear();

  await dataSource.query(
    'TRUNCATE TABLE "email_verifications", "gallery_invitations", "images", "galleries", "users" RESTART IDENTITY CASCADE',
  );

  await rm(uploadImagesDir, {
    recursive: true,
    force: true,
  });

  await mkdir(uploadImagesDir, {
    recursive: true,
  });
}

export async function cleanupUploads(): Promise<void> {
  await rm(uploadImagesDir, {
    recursive: true,
    force: true,
  });
}

export async function registerUser(
  app: INestApplication<App>,
  overrides: Partial<RegisterUserPayload> = {},
): Promise<string> {
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

  expect(response.body).toEqual({
    message: 'Verification code sent',
  });

  const verificationCode = sentVerificationCodes.get(payload.email);

  if (!verificationCode) {
    throw new Error(`Expected verification code for ${payload.email}`);
  }

  const verifyResponse = await request(app.getHttpServer())
    .post('/auth/verify-email')
    .send({
      email: payload.email,
      code: verificationCode,
    })
    .expect(200);

  const responseBody = verifyResponse.body as unknown as AuthResponseBody;

  return responseBody.token;
}

export async function createGallery(
  app: INestApplication<App>,
  token: string,
  overrides: Partial<CreateGalleryPayload> = {},
): Promise<GalleryResponseBody> {
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
}

export async function uploadImage(
  app: INestApplication<App>,
  token: string,
  galleryId: number,
): Promise<ImageResponseBody> {
  const response = await request(app.getHttpServer())
    .post(`/galleries/${galleryId}/images`)
    .set('Authorization', `Bearer ${token}`)
    .attach(UPLOAD_IMAGES_FIELD_NAME, Buffer.from('test image content'), {
      filename: 'lake.png',
      contentType: 'image/png',
    })
    .field(
      'metafields',
      JSON.stringify([
        {
          name: 'Lake',
          comment: 'Summer photo',
        },
      ]),
    )
    .expect(201);

  const responseBody = response.body as ImageResponseBody[];

  expect(responseBody).toHaveLength(1);

  const uploadedImage = responseBody[0];

  if (!uploadedImage) {
    throw new Error('Expected uploaded image');
  }

  return uploadedImage;
}

export async function getGalleryImages(
  app: INestApplication<App>,
  token: string,
  galleryId: number,
): Promise<ImagesListResponseBody> {
  const response = await request(app.getHttpServer())
    .get(`/galleries/${galleryId}/images`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return response.body as ImagesListResponseBody;
}
