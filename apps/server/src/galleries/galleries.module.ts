import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';
import { Gallery } from './entities/gallery.entity';
import { GalleryImage } from '../images/entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery, GalleryImage])],
  controllers: [GalleriesController],
  providers: [GalleriesService],
})
export class GalleriesModule {}
