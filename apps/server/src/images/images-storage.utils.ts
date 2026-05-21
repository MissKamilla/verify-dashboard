import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { basename, extname, join } from 'node:path';

import {
  DEFAULT_UPLOAD_IMAGES_DIR,
  DEFAULT_UPLOAD_IMAGES_PUBLIC_PATH,
} from './images.constants';

type FileWithPath = {
  path: string;
};

export function generateStoredImageFilename(fileExtension: string): string {
  return `${randomUUID()}${fileExtension}`;
}

export function getUploadImagesDir(): string {
  return process.env.UPLOAD_IMAGES_DIR || DEFAULT_UPLOAD_IMAGES_DIR;
}

export function getUploadImagesPublicPath(): string {
  return (
    process.env.UPLOAD_IMAGES_PUBLIC_PATH || DEFAULT_UPLOAD_IMAGES_PUBLIC_PATH
  )
    .replaceAll('\\', '/')
    .replace(/^\/?/, '/')
    .replace(/\/+$/g, '');
}

export function buildStoredImagePath(filename: string): string {
  return `${getUploadImagesPublicPath()}/${filename}`;
}

export function buildLocalImageFilePath(storedPath: string): string {
  const filename = basename(storedPath);

  return join(process.cwd(), getUploadImagesDir(), filename);
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
  const sourceFilePath = buildLocalImageFilePath(sourceStoredPath);
  const fileExtension = extname(sourceStoredPath);
  const filename = generateStoredImageFilename(fileExtension);
  const targetStoredPath = buildStoredImagePath(filename);
  const targetFilePath = buildLocalImageFilePath(targetStoredPath);

  await mkdir(join(process.cwd(), getUploadImagesDir()), { recursive: true });
  await copyFile(sourceFilePath, targetFilePath);

  return targetStoredPath;
}
export async function ensureUploadImagesDirExists(): Promise<void> {
  await mkdir(join(process.cwd(), getUploadImagesDir()), { recursive: true });
}
