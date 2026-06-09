import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { join } from 'node:path';

import {
  ALLOWED_IMAGE_FORMATS_LABEL,
  MAX_IMAGE_SIZE_IN_BYTES,
} from './images.constants';
import {
  generateStoredImageFilename,
  getUploadImagesDir,
} from './images-storage.utils';
import { getImagesUploadOptions } from './images-upload.config';

jest.mock('multer', () => ({
  diskStorage: jest.fn((options: unknown) => options),
}));

jest.mock('./images-storage.utils', () => ({
  generateStoredImageFilename: jest.fn(),
  getUploadImagesDir: jest.fn(),
}));

type StorageConfig = {
  destination: (
    request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void,
  ) => void;

  filename: (
    request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) => void;
};

describe('getImagesUploadOptions', () => {
  const request = {} as Request;

  const createFile = (
    originalname: string,
    mimetype: string,
  ): Express.Multer.File =>
    ({
      originalname,
      mimetype,
    }) as Express.Multer.File;

  const getStorageConfig = (): StorageConfig => {
    getImagesUploadOptions();

    return jest.mocked(diskStorage).mock.calls[0][0] as StorageConfig;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(getUploadImagesDir).mockReturnValue('custom/uploads');

    jest
      .mocked(generateStoredImageFilename)
      .mockImplementation((extension) => `generated${extension}`);
  });

  it('sets maximum uploaded file size', () => {
    const options = getImagesUploadOptions();

    expect(options.limits).toEqual({
      fileSize: MAX_IMAGE_SIZE_IN_BYTES,
    });
  });

  it('uses configured upload directory as storage destination', () => {
    const storageConfig = getStorageConfig();

    const callback = jest.fn();

    storageConfig.destination(
      request,
      createFile('photo.jpg', 'image/jpeg'),
      callback,
    );

    expect(callback).toHaveBeenCalledWith(
      null,
      join(process.cwd(), 'custom/uploads'),
    );
  });

  it('uses lowercase original file extension when it exists', () => {
    const storageConfig = getStorageConfig();

    const callback = jest.fn();

    storageConfig.filename(
      request,
      createFile('PHOTO.PNG', 'image/png'),
      callback,
    );

    expect(generateStoredImageFilename).toHaveBeenCalledWith('.png');

    expect(callback).toHaveBeenCalledWith(null, 'generated.png');
  });

  it.each([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/gif', '.bin'],
  ])(
    'uses %s fallback extension when original filename has no extension',
    (mimetype, expectedExtension) => {
      const storageConfig = getStorageConfig();

      const callback = jest.fn();

      storageConfig.filename(request, createFile('photo', mimetype), callback);

      expect(generateStoredImageFilename).toHaveBeenCalledWith(
        expectedExtension,
      );

      expect(callback).toHaveBeenCalledWith(
        null,
        `generated${expectedExtension}`,
      );
    },
  );

  it.each(['image/jpeg', 'image/png'])(
    'accepts supported format %s',
    (mimetype) => {
      const options = getImagesUploadOptions();

      const callback = jest.fn();

      options.fileFilter?.(request, createFile('photo', mimetype), callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    },
  );

  it('rejects unsupported image format', () => {
    const options = getImagesUploadOptions();

    const callback = jest.fn();

    options.fileFilter?.(
      request,
      createFile('photo.gif', 'image/gif'),
      callback,
    );

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false,
    );

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `Only ${ALLOWED_IMAGE_FORMATS_LABEL} files are allowed`,
      }),
      false,
    );
  });
});
