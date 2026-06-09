import { INestApplication } from '@nestjs/common';
import { readdir } from 'node:fs/promises';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import {
  MAX_IMAGES_PER_GALLERY,
  UPLOAD_IMAGES_FIELD_NAME,
} from '../src/images/images.constants';
import {
  cleanupUploads,
  createE2eApp,
  createGallery,
  getGalleryImages,
  registerUser,
  resetE2eState,
  uploadImage,
  uploadImagesDir,
} from './e2e-utils';
import { ImageResponseBody, ImagesListResponseBody } from './e2e-types';

describe('Images integration', () => {
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

  it('uploads image with metafields and returns it in gallery images list', async () => {
    const token = await registerUser(app);

    const gallery = await createGallery(app, token);

    const uploadedImage = await uploadImage(app, token, gallery.id);

    expect(uploadedImage.id).toBe(1);

    expect(uploadedImage.galleryId).toBe(gallery.id);

    expect(uploadedImage.originalFilename).toBe('lake.png');

    expect(uploadedImage.metafields).toEqual({
      name: 'Lake',
      comment: 'Summer photo',
    });

    expect(uploadedImage.path).toMatch(/^\/uploads\/test-images\/.+\.png$/);

    expect(typeof uploadedImage.createdAt).toBe('string');

    expect(Number.isNaN(Date.parse(uploadedImage.createdAt))).toBe(false);

    const storedFilenames = await readdir(uploadImagesDir);

    expect(storedFilenames).toHaveLength(1);

    expect(uploadedImage.path.endsWith(`/${storedFilenames[0]}`)).toBe(true);

    const listResponse = await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const listResponseBody = listResponse.body as ImagesListResponseBody;

    expect(listResponseBody.total).toBe(1);

    expect(listResponseBody.page).toBe(1);

    expect(listResponseBody.limit).toBe(10);

    expect(listResponseBody.items).toHaveLength(1);

    expect(listResponseBody.items[0]).toEqual(
      expect.objectContaining({
        id: uploadedImage.id,
        galleryId: gallery.id,
        originalFilename: 'lake.png',
        path: uploadedImage.path,
        metafields: {
          name: 'Lake',
          comment: 'Summer photo',
        },
      }),
    );
  });

  it('updates image metafields and persists changes', async () => {
    const token = await registerUser(app);

    const gallery = await createGallery(app, token);

    const uploadedImage = await uploadImage(app, token, gallery.id);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/images/${uploadedImage.id}/metafields`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '  Updated lake  ',
        comment: '  Updated comment  ',
      })
      .expect(200);

    const updatedImage = updateResponse.body as ImageResponseBody;

    expect(updatedImage.metafields).toEqual({
      name: 'Updated lake',
      comment: 'Updated comment',
    });

    const listResponse = await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const listResponseBody = listResponse.body as ImagesListResponseBody;

    expect(listResponseBody.items[0]?.metafields).toEqual({
      name: 'Updated lake',
      comment: 'Updated comment',
    });
  });

  it('rejects unsupported image format without storing file', async () => {
    const token = await registerUser(app);

    const gallery = await createGallery(app, token);

    await request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach(UPLOAD_IMAGES_FIELD_NAME, Buffer.from('text file content'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      })
      .expect(400);

    const storedFilenames = await readdir(uploadImagesDir);

    expect(storedFilenames).toEqual([]);

    const listResponse = await request(app.getHttpServer())
      .get(`/galleries/${gallery.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const listResponseBody = listResponse.body as ImagesListResponseBody;

    expect(listResponseBody.items).toEqual([]);

    expect(listResponseBody.total).toBe(0);
  });

  it('rejects upload without files', async () => {
    const token = await registerUser(app);

    const gallery = await createGallery(app, token);

    await request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: 'At least one image is required',
          }),
        );
      });

    const galleryImages = await getGalleryImages(app, token, gallery.id);

    expect(galleryImages.items).toEqual([]);

    expect(galleryImages.total).toBe(0);

    expect(await readdir(uploadImagesDir)).toEqual([]);
  });

  it('rejects invalid metafields JSON and removes uploaded file', async () => {
    const token = await registerUser(app);

    const gallery = await createGallery(app, token);

    await request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach(UPLOAD_IMAGES_FIELD_NAME, Buffer.from('test image content'), {
        filename: 'lake.png',
        contentType: 'image/png',
      })
      .field('metafields', 'not-json')
      .expect(400)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: 'Metafields must be a valid JSON string',
          }),
        );
      });

    const galleryImages = await getGalleryImages(app, token, gallery.id);

    expect(galleryImages.items).toEqual([]);

    expect(galleryImages.total).toBe(0);

    expect(await readdir(uploadImagesDir)).toEqual([]);
  });

  it('rejects upload when files count exceeds gallery limit', async () => {
    const token = await registerUser(app);

    const gallery = await createGallery(app, token);

    const uploadRequest = request(app.getHttpServer())
      .post(`/galleries/${gallery.id}/images`)
      .set('Authorization', `Bearer ${token}`);

    for (let index = 0; index <= MAX_IMAGES_PER_GALLERY; index += 1) {
      uploadRequest.attach(
        UPLOAD_IMAGES_FIELD_NAME,
        Buffer.from(`test image content ${index}`),
        {
          filename: `lake-${index}.png`,
          contentType: 'image/png',
        },
      );
    }

    await uploadRequest.expect(400);

    const galleryImages = await getGalleryImages(app, token, gallery.id);

    expect(galleryImages.items).toEqual([]);

    expect(galleryImages.total).toBe(0);
  });

  it('moves image to another gallery without creating extra file', async () => {
    const token = await registerUser(app);

    const sourceGallery = await createGallery(app, token, {
      title: 'Source',
    });

    const targetGallery = await createGallery(app, token, {
      title: 'Target',
    });

    const uploadedImage = await uploadImage(app, token, sourceGallery.id);

    const storedFilenamesBeforeMove = await readdir(uploadImagesDir);

    const response = await request(app.getHttpServer())
      .patch('/images/move')
      .set('Authorization', `Bearer ${token}`)
      .send({
        imageIds: [uploadedImage.id],
        targetGalleryId: targetGallery.id,
      })
      .expect(200);

    const movedImages = response.body as ImageResponseBody[];

    expect(movedImages).toHaveLength(1);

    expect(movedImages[0]?.galleryId).toBe(targetGallery.id);

    const sourceGalleryImages = await getGalleryImages(
      app,
      token,
      sourceGallery.id,
    );

    const targetGalleryImages = await getGalleryImages(
      app,
      token,
      targetGallery.id,
    );

    expect(sourceGalleryImages.total).toBe(0);

    expect(targetGalleryImages.total).toBe(1);

    expect(targetGalleryImages.items[0]?.path).toBe(uploadedImage.path);

    const storedFilenamesAfterMove = await readdir(uploadImagesDir);

    expect(storedFilenamesAfterMove).toEqual(storedFilenamesBeforeMove);
  });

  it('copies image to another gallery and creates copied file', async () => {
    const token = await registerUser(app);

    const sourceGallery = await createGallery(app, token, {
      title: 'Source',
    });

    const targetGallery = await createGallery(app, token, {
      title: 'Target',
    });

    const uploadedImage = await uploadImage(app, token, sourceGallery.id);

    const response = await request(app.getHttpServer())
      .post('/images/copy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        imageIds: [uploadedImage.id],
        targetGalleryId: targetGallery.id,
      })
      .expect(201);

    const copiedImages = response.body as ImageResponseBody[];

    expect(copiedImages).toHaveLength(1);

    const copiedImage = copiedImages[0];

    if (!copiedImage) {
      throw new Error('Expected copied image');
    }

    expect(copiedImage.id).not.toBe(uploadedImage.id);

    expect(copiedImage.galleryId).toBe(targetGallery.id);

    expect(copiedImage.path).not.toBe(uploadedImage.path);

    expect(copiedImage.originalFilename).toBe(uploadedImage.originalFilename);

    expect(copiedImage.metafields).toEqual(uploadedImage.metafields);

    const sourceGalleryImages = await getGalleryImages(
      app,
      token,
      sourceGallery.id,
    );

    const targetGalleryImages = await getGalleryImages(
      app,
      token,
      targetGallery.id,
    );

    expect(sourceGalleryImages.total).toBe(1);

    expect(targetGalleryImages.total).toBe(1);

    const storedFilenames = await readdir(uploadImagesDir);

    expect(storedFilenames).toHaveLength(2);
  });

  it('deletes image from database and removes stored file', async () => {
    const token = await registerUser(app);

    const gallery = await createGallery(app, token);

    const uploadedImage = await uploadImage(app, token, gallery.id);

    expect(await readdir(uploadImagesDir)).toHaveLength(1);

    await request(app.getHttpServer())
      .delete('/images')
      .set('Authorization', `Bearer ${token}`)
      .query({
        imageIds: uploadedImage.id,
      })
      .expect(204);

    const galleryImages = await getGalleryImages(app, token, gallery.id);

    expect(galleryImages.items).toEqual([]);

    expect(galleryImages.total).toBe(0);

    expect(await readdir(uploadImagesDir)).toEqual([]);
  });

  it('does not upload image to another user gallery and removes uploaded file', async () => {
    const ownerToken = await registerUser(app);

    const anotherUserToken = await registerUser(app, {
      firstname: 'Bob',
      lastname: 'Brown',
      email: 'bob@test.com',
    });

    const ownerGallery = await createGallery(app, ownerToken);

    await request(app.getHttpServer())
      .post(`/galleries/${ownerGallery.id}/images`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .attach(UPLOAD_IMAGES_FIELD_NAME, Buffer.from('test image content'), {
        filename: 'lake.png',
        contentType: 'image/png',
      })
      .field(
        'metafields',
        JSON.stringify([
          {
            name: 'Lake',
          },
        ]),
      )
      .expect(404);

    expect(await readdir(uploadImagesDir)).toEqual([]);

    const ownerGalleryImages = await getGalleryImages(
      app,
      ownerToken,
      ownerGallery.id,
    );

    expect(ownerGalleryImages.items).toEqual([]);

    expect(ownerGalleryImages.total).toBe(0);
  });

  it('does not expose another user gallery images list', async () => {
    const ownerToken = await registerUser(app);

    const anotherUserToken = await registerUser(app, {
      firstname: 'Bob',
      lastname: 'Brown',
      email: 'bob@test.com',
    });

    const ownerGallery = await createGallery(app, ownerToken);

    await uploadImage(app, ownerToken, ownerGallery.id);

    await request(app.getHttpServer())
      .get(`/galleries/${ownerGallery.id}/images`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .expect(404);
  });

  it('does not allow another user to update, move, copy or delete image', async () => {
    const ownerToken = await registerUser(app);

    const anotherUserToken = await registerUser(app, {
      firstname: 'Bob',
      lastname: 'Brown',
      email: 'bob@test.com',
    });

    const ownerGallery = await createGallery(app, ownerToken, {
      title: 'Owner gallery',
    });

    const anotherUserGallery = await createGallery(app, anotherUserToken, {
      title: 'Another user gallery',
    });

    const uploadedImage = await uploadImage(app, ownerToken, ownerGallery.id);

    await request(app.getHttpServer())
      .patch(`/images/${uploadedImage.id}/metafields`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({
        name: 'Stolen image',
      })
      .expect(404);

    await request(app.getHttpServer())
      .patch('/images/move')
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({
        imageIds: [uploadedImage.id],
        targetGalleryId: anotherUserGallery.id,
      })
      .expect(404);

    await request(app.getHttpServer())
      .post('/images/copy')
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({
        imageIds: [uploadedImage.id],
        targetGalleryId: anotherUserGallery.id,
      })
      .expect(404);

    await request(app.getHttpServer())
      .delete('/images')
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .query({
        imageIds: uploadedImage.id,
      })
      .expect(404);

    const ownerGalleryImages = await getGalleryImages(
      app,
      ownerToken,
      ownerGallery.id,
    );

    expect(ownerGalleryImages.total).toBe(1);

    expect(ownerGalleryImages.items[0]).toEqual(
      expect.objectContaining({
        id: uploadedImage.id,
        galleryId: ownerGallery.id,
        path: uploadedImage.path,
        metafields: {
          name: 'Lake',
          comment: 'Summer photo',
        },
      }),
    );

    const anotherUserGalleryImages = await getGalleryImages(
      app,
      anotherUserToken,
      anotherUserGallery.id,
    );

    expect(anotherUserGalleryImages.total).toBe(0);

    expect(await readdir(uploadImagesDir)).toHaveLength(1);
  });
});
