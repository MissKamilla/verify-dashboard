import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Gallery } from '../galleries/entities/gallery.entity';
import { GalleryImage } from './entities/image.entity';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryImage, Gallery])],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
