import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

import {
  DEFAULT_UPLOAD_IMAGES_DIR,
  DEFAULT_UPLOAD_IMAGES_PUBLIC_PATH,
} from './images.constants';
import {
  buildLocalImageFilePath,
  buildStoredImagePath,
  copyStoredImageFile,
  ensureUploadImagesDirExists,
  generateStoredImageFilename,
  getUploadImagesDir,
  getUploadImagesPublicPath,
  removeStoredImageFile,
  removeUploadedFiles,
} from './images-storage.utils';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

jest.mock('node:fs/promises', () => ({
  copyFile: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
}));

describe('images-storage.utils', () => {
  const uuid = '11111111-1111-4111-8111-111111111111';

  const originalUploadImagesDir = process.env.UPLOAD_IMAGES_DIR;
  const originalUploadImagesPublicPath = process.env.UPLOAD_IMAGES_PUBLIC_PATH;

  beforeEach(() => {
    jest.clearAllMocks();

    delete process.env.UPLOAD_IMAGES_DIR;
    delete process.env.UPLOAD_IMAGES_PUBLIC_PATH;

    jest.mocked(randomUUID).mockReturnValue(uuid);

    jest.mocked(copyFile).mockResolvedValue(undefined);
    jest.mocked(mkdir).mockResolvedValue(undefined);
    jest.mocked(unlink).mockResolvedValue(undefined);
  });

  afterAll(() => {
    if (originalUploadImagesDir === undefined) {
      delete process.env.UPLOAD_IMAGES_DIR;
    } else {
      process.env.UPLOAD_IMAGES_DIR = originalUploadImagesDir;
    }

    if (originalUploadImagesPublicPath === undefined) {
      delete process.env.UPLOAD_IMAGES_PUBLIC_PATH;
    } else {
      process.env.UPLOAD_IMAGES_PUBLIC_PATH = originalUploadImagesPublicPath;
    }
  });

  it('generates stored image filename with UUID and extension', () => {
    expect(generateStoredImageFilename('.jpg')).toBe(`${uuid}.jpg`);
  });

  it('returns default upload directory when env variable is not provided', () => {
    expect(getUploadImagesDir()).toBe(DEFAULT_UPLOAD_IMAGES_DIR);
  });

  it('returns upload directory from env variable', () => {
    process.env.UPLOAD_IMAGES_DIR = 'custom/images';

    expect(getUploadImagesDir()).toBe('custom/images');
  });

  it('normalizes public upload path from env variable', () => {
    process.env.UPLOAD_IMAGES_PUBLIC_PATH = '\\custom\\images\\\\';

    expect(getUploadImagesPublicPath()).toBe('/custom/images');
  });

  it('returns default public upload path when env variable is not provided', () => {
    expect(getUploadImagesPublicPath()).toBe(DEFAULT_UPLOAD_IMAGES_PUBLIC_PATH);
  });

  it('builds public stored image path', () => {
    expect(buildStoredImagePath('photo.jpg')).toBe('/uploads/images/photo.jpg');
  });

  it('builds local image file path using filename from stored path', () => {
    expect(buildLocalImageFilePath('/uploads/images/photo.jpg')).toBe(
      join(process.cwd(), DEFAULT_UPLOAD_IMAGES_DIR, 'photo.jpg'),
    );
  });

  it('attempts to remove all uploaded files even when one removal fails', async () => {
    jest
      .mocked(unlink)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Cannot remove file'));

    await expect(
      removeUploadedFiles([
        {
          path: '/tmp/photo-1.jpg',
        },
        {
          path: '/tmp/photo-2.jpg',
        },
      ]),
    ).resolves.toBeUndefined();

    expect(unlink).toHaveBeenNthCalledWith(1, '/tmp/photo-1.jpg');

    expect(unlink).toHaveBeenNthCalledWith(2, '/tmp/photo-2.jpg');
  });

  it('ignores error when stored file does not exist', async () => {
    jest.mocked(unlink).mockRejectedValue(new Error('File not found'));

    await expect(
      removeStoredImageFile('/uploads/images/photo.jpg'),
    ).resolves.toBeUndefined();

    expect(unlink).toHaveBeenCalledWith(
      join(process.cwd(), DEFAULT_UPLOAD_IMAGES_DIR, 'photo.jpg'),
    );
  });

  it('copies stored image file and returns new public path', async () => {
    const result = await copyStoredImageFile('/uploads/images/original.png');

    const generatedFilename = `${uuid}.png`;

    expect(mkdir).toHaveBeenCalledWith(
      join(process.cwd(), DEFAULT_UPLOAD_IMAGES_DIR),
      {
        recursive: true,
      },
    );

    expect(copyFile).toHaveBeenCalledWith(
      join(process.cwd(), DEFAULT_UPLOAD_IMAGES_DIR, 'original.png'),
      join(process.cwd(), DEFAULT_UPLOAD_IMAGES_DIR, generatedFilename),
    );

    expect(result).toBe(`/uploads/images/${generatedFilename}`);
  });

  it('creates upload directory recursively', async () => {
    await ensureUploadImagesDirExists();

    expect(mkdir).toHaveBeenCalledWith(
      join(process.cwd(), DEFAULT_UPLOAD_IMAGES_DIR),
      {
        recursive: true,
      },
    );
  });
});
