import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GalleryImage } from '../images/entities/image.entity';
import { GalleryAccess } from './entities/gallery-access.entity';
import { Gallery } from './entities/gallery.entity';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gallery, GalleryImage, GalleryAccess, User]),
  ],
  controllers: [GalleriesController],
  providers: [GalleriesService],
  exports: [GalleriesService],
})
export class GalleriesModule {}
