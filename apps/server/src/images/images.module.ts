import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GalleryImage } from './entities/image.entity';
import { GalleriesModule } from '../galleries/galleries.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [GalleriesModule, TypeOrmModule.forFeature([GalleryImage])],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
