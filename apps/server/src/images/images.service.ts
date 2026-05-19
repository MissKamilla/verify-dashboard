import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Gallery } from '../galleries/entities/gallery.entity';
import { GalleryImage } from './entities/image.entity';
import { GetImagesQueryDto } from './dto/get-images-query.dto';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(GalleryImage)
    private readonly imagesRepository: Repository<GalleryImage>,

    @InjectRepository(Gallery)
    private readonly galleriesRepository: Repository<Gallery>,
  ) {}

  async findByGallery(
    galleryId: number,
    userId: number,
    query: GetImagesQueryDto,
  ): Promise<{
    items: GalleryImage[];
    total: number;
    page: number;
    limit: number;
  }> {
    const gallery = await this.galleriesRepository.findOne({
      where: {
        id: galleryId,
        userId,
      },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.imagesRepository.findAndCount({
      where: {
        galleryId,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }
}
