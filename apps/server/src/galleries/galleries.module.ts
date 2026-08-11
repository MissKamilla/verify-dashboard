import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Gallery } from './entities/gallery.entity';
import { GalleryAccess } from './entities/gallery-access.entity';
import { GalleryInvitation } from './entities/gallery-invitation.entity';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { MailModule } from '../mail/mail.module';
import { GalleryImage } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Gallery,
      GalleryImage,
      GalleryAccess,
      GalleryInvitation,
      User,
    ]),
    MailModule,
  ],
  controllers: [GalleriesController],
  providers: [GalleriesService],
  exports: [GalleriesService],
})
export class GalleriesModule {}
