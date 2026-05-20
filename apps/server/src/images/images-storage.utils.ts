import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

import { DEFAULT_UPLOAD_IMAGES_DIR } from './images.constants';

type FileWithPath = {
  path: string;
};

export function getUploadImagesDir(): string {
  return process.env.UPLOAD_IMAGES_DIR || DEFAULT_UPLOAD_IMAGES_DIR;
}

export function buildStoredImagePath(filename: string): string {
  const uploadDir = getUploadImagesDir()
    .replaceAll('\\', '/')
    .replace(/^\/+|\/+$/g, '');

  return `/${uploadDir}/${filename}`;
}

export function buildLocalImageFilePath(storedPath: string): string {
  const normalizedPath = storedPath.replaceAll('\\', '/').replace(/^\/+/, '');

  return join(process.cwd(), normalizedPath);
}

export async function removeUploadedFiles(
  files: FileWithPath[],
): Promise<void> {
  await Promise.allSettled(files.map((file) => unlink(file.path)));
}

export async function removeStoredImageFile(storedPath: string): Promise<void> {
  const filePath = buildLocalImageFilePath(storedPath);

  await unlink(filePath).catch(() => undefined);
}
