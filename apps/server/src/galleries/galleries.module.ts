import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';
import { Gallery } from './entities/gallery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery])],
  controllers: [GalleriesController],
  providers: [GalleriesService, JwtAuthGuard],
})
export class GalleriesModule {}
