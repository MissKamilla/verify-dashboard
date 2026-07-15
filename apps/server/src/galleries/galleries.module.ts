import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GalleryImage } from '../images/entities/image.entity';
import { GalleryAccess } from './entities/gallery-access.entity';
import { Gallery } from './entities/gallery.entity';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery, GalleryImage, GalleryAccess])],
  controllers: [GalleriesController],
  providers: [GalleriesService],
})
export class GalleriesModule {}
