import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';

import { DEFAULT_UPLOAD_IMAGES_DIR } from './images.constants';

type FileWithPath = {
  path: string;
};

export function generateStoredImageFilename(fileExtension: string): string {
  return `${randomUUID()}${fileExtension}`;
}

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

export async function copyStoredImageFile(
  sourceStoredPath: string,
): Promise<string> {
  const sourceFilePath = buildLocalImageFilePath(sourceStoredPath); // path/to/project/uploads/images/abc-123.jpg
  const fileExtension = extname(sourceStoredPath); // .jpg
  const filename = generateStoredImageFilename(fileExtension); // 77576032-31a8-4609-a3bd-7020a2d0c71f.jpg
  const targetStoredPath = buildStoredImagePath(filename); // /uploads/images/77576032-31a8-4609-a3bd-7020a2d0c71f.jpg
  const targetFilePath = buildLocalImageFilePath(targetStoredPath); // /path/to/project/uploads/images/77576032-31a8-4609-a3bd-7020a2d0c71f.jpg

  await mkdir(join(process.cwd(), getUploadImagesDir()), { recursive: true });
  await copyFile(sourceFilePath, targetFilePath);

  return targetStoredPath;
}
