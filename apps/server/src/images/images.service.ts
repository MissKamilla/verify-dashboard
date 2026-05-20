import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Gallery } from '../galleries/entities/gallery.entity';
import { GalleryImage } from './entities/image.entity';
import { GetImagesQueryDto } from './dto/get-images-query.dto';
import {
  buildStoredImagePath,
  removeUploadedFiles,
  removeStoredImageFile,
} from './images-storage.utils';
import { MAX_IMAGES_PER_GALLERY } from './images.constants';

type UploadedImageFile = Pick<
  Express.Multer.File,
  'path' | 'filename' | 'originalname'
>;

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

  async uploadToGallery(
    galleryId: number,
    userId: number,
    files: UploadedImageFile[],
  ): Promise<GalleryImage[]> {
    const gallery = await this.galleriesRepository.findOne({
      where: {
        id: galleryId,
        userId,
      },
    });

    if (!gallery) {
      await removeUploadedFiles(files);
      throw new NotFoundException('Gallery not found');
    }

    const existingImagesCount = await this.imagesRepository.count({
      where: {
        galleryId,
      },
    });

    const nextImagesCount = existingImagesCount + files.length;

    if (nextImagesCount > MAX_IMAGES_PER_GALLERY) {
      await removeUploadedFiles(files);

      throw new BadRequestException(
        `Gallery cannot contain more than ${MAX_IMAGES_PER_GALLERY} images`,
      );
    }

    const images = files.map((file) =>
      this.imagesRepository.create({
        path: buildStoredImagePath(file.filename),
        galleryId,
        originalFilename: file.originalname,
        metafields: {},
      }),
    );

    return this.imagesRepository.save(images);
  }

  async deleteImage(imageId: number, userId: number): Promise<void> {
    const image = await this.imagesRepository.findOne({
      where: {
        id: imageId,
        gallery: {
          userId,
        },
      },
      relations: {
        gallery: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.imagesRepository.remove(image);
    await removeStoredImageFile(image.path);
  }
}
