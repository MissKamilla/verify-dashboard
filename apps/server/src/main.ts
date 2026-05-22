import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import {
  ensureUploadImagesDirExists,
  getUploadImagesDir,
  getUploadImagesPublicPath,
} from './images/images-storage.utils';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  });

  const uploadImagesPublicPath = getUploadImagesPublicPath();

  await ensureUploadImagesDirExists();

  app.useStaticAssets(join(process.cwd(), getUploadImagesDir()), {
    prefix: `${uploadImagesPublicPath}/`,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Verify Dashboard API')
    .setDescription('API documentation for Verify Dashboard')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
