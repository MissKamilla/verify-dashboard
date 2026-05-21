import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';

import {
  ALLOWED_IMAGE_FORMATS_LABEL,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_IN_BYTES,
} from './images.constants';
import {
  generateStoredImageFilename,
  getUploadImagesDir,
} from './images-storage.utils';

type DiskStorageDestinationCallback = (
  error: Error | null,
  destination: string,
) => void;

type DiskStorageFilenameCallback = (
  error: Error | null,
  filename: string,
) => void;

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export function getImagesUploadOptions(): MulterOptions {
  return {
    storage: diskStorage({
      destination: (
        _req: Request,
        _file: Express.Multer.File,
        callback: DiskStorageDestinationCallback,
      ) => {
        const uploadDir = join(process.cwd(), getUploadImagesDir());

        callback(null, uploadDir);
      },

      filename: (
        _req: Request,
        file: Express.Multer.File,
        callback: DiskStorageFilenameCallback,
      ) => {
        const fileExtension = getFileExtension(file);
        const filename = generateStoredImageFilename(fileExtension);

        callback(null, filename);
      },
    }),

    limits: {
      fileSize: MAX_IMAGE_SIZE_IN_BYTES,
    },

    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      callback: FileFilterCallback,
    ) => {
      if (!isAllowedImageMimeType(file.mimetype)) {
        callback(
          new BadRequestException(
            `Only ${ALLOWED_IMAGE_FORMATS_LABEL} files are allowed`,
          ),
          false,
        );
        return;
      }

      callback(null, true);
    },
  };
}

function isAllowedImageMimeType(
  mimeType: string,
): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

function getFileExtension(file: Express.Multer.File): string {
  const fileExtension = extname(file.originalname).toLowerCase();

  if (fileExtension) {
    return fileExtension;
  }

  if (file.mimetype === 'image/jpeg') {
    return '.jpg';
  }

  if (file.mimetype === 'image/png') {
    return '.png';
  }

  return '.bin';
}
