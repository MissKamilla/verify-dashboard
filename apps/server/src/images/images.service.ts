import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Gallery } from '../galleries/entities/gallery.entity';
import { GalleryImage } from './entities/image.entity';
import { GetImagesQueryDto } from './dto/get-images-query.dto';
import { UpdateImageMetafieldsDto } from './dto/update-image-metafields.dto';
import {
  buildStoredImagePath,
  copyStoredImageFile,
  removeStoredImageFile,
  removeUploadedFiles,
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

    private readonly dataSource: DataSource,
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
    await this.findOwnedGalleryOrFail(galleryId, userId);

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
    metafields?: UpdateImageMetafieldsDto[],
  ): Promise<GalleryImage[]> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const galleriesRepository = manager.getRepository(Gallery);
        const imagesRepository = manager.getRepository(GalleryImage);

        await this.findOwnedGalleryOrFail(
          galleryId,
          userId,
          'Gallery not found',
          galleriesRepository,
        );

        await this.ensureGalleryCanAcceptImages(
          galleryId,
          files.length,
          imagesRepository,
        );

        if (metafields && metafields.length !== files.length) {
          throw new BadRequestException(
            'Metafields count must match uploaded files count',
          );
        }

        const images = files.map((file, index) =>
          imagesRepository.create({
            path: buildStoredImagePath(file.filename),
            galleryId,
            originalFilename: file.originalname,
            metafields: metafields?.[index] ?? {},
          }),
        );

        return imagesRepository.save(images);
      });
    } catch (error) {
      await removeUploadedFiles(files);

      throw error;
    }
  }

  async updateMetafields(
    imageId: number,
    userId: number,
    dto: UpdateImageMetafieldsDto,
  ): Promise<GalleryImage> {
    const image = await this.findOwnedImageOrFail(imageId, userId);

    const nextMetafields = {
      ...(image.metafields ?? {}),
    };

    if (dto.name !== undefined) {
      nextMetafields.name = dto.name;
    }

    if (dto.comment !== undefined) {
      nextMetafields.comment = dto.comment;
    }

    image.metafields = nextMetafields;

    return this.imagesRepository.save(image);
  }

  async moveImages(
    imageIds: number[],
    userId: number,
    targetGalleryId: number,
  ): Promise<GalleryImage[]> {
    return this.dataSource.transaction(async (manager) => {
      const galleriesRepository = manager.getRepository(Gallery);
      const imagesRepository = manager.getRepository(GalleryImage);

      await this.findOwnedGalleryOrFail(
        targetGalleryId,
        userId,
        'Target gallery not found',
        galleriesRepository,
      );

      const images = await this.findOwnedImagesOrFail(
        imageIds,
        userId,
        imagesRepository,
      );

      this.ensureImagesAreNotInGallery(images, targetGalleryId);

      await this.ensureGalleryCanAcceptImages(
        targetGalleryId,
        images.length,
        imagesRepository,
      );

      images.forEach((image) => {
        image.galleryId = targetGalleryId;
      });

      return imagesRepository.save(images);
    });
  }

  async copyImages(
    imageIds: number[],
    userId: number,
    targetGalleryId: number,
  ): Promise<GalleryImage[]> {
    const copiedPaths: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const galleriesRepository = manager.getRepository(Gallery);
        const imagesRepository = manager.getRepository(GalleryImage);

        await this.findOwnedGalleryOrFail(
          targetGalleryId,
          userId,
          'Target gallery not found',
          galleriesRepository,
        );

        const images = await this.findOwnedImagesOrFail(
          imageIds,
          userId,
          imagesRepository,
        );

        await this.ensureGalleryCanAcceptImages(
          targetGalleryId,
          images.length,
          imagesRepository,
        );

        const copiedImages = await Promise.all(
          images.map(async (image) => {
            const copiedPath = await copyStoredImageFile(image.path);

            copiedPaths.push(copiedPath);

            return imagesRepository.create({
              path: copiedPath,
              galleryId: targetGalleryId,
              originalFilename: image.originalFilename,
              metafields: {
                ...(image.metafields ?? {}),
              },
            });
          }),
        );

        return imagesRepository.save(copiedImages);
      });
    } catch (error) {
      await Promise.all(copiedPaths.map((path) => removeStoredImageFile(path)));

      throw error;
    }
  }

  async deleteImages(imageIds: number[], userId: number): Promise<void> {
    const images = await this.dataSource.transaction(async (manager) => {
      const imagesRepository = manager.getRepository(GalleryImage);

      const ownedImages = await this.findOwnedImagesOrFail(
        imageIds,
        userId,
        imagesRepository,
      );

      await imagesRepository.remove(ownedImages);

      return ownedImages;
    });

    await Promise.all(images.map((image) => removeStoredImageFile(image.path)));
  }

  private async findOwnedImageOrFail(
    imageId: number,
    userId: number,
  ): Promise<GalleryImage> {
    const image = await this.imagesRepository.findOne({
      where: {
        id: imageId,
        gallery: {
          userId,
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  private async findOwnedImagesOrFail(
    imageIds: number[],
    userId: number,
    imagesRepository = this.imagesRepository,
  ): Promise<GalleryImage[]> {
    const images = await imagesRepository.find({
      where: {
        id: In(imageIds),
        gallery: {
          userId,
        },
      },
    });

    if (images.length !== imageIds.length) {
      throw new NotFoundException('One or more images not found');
    }

    return images;
  }

  private async findOwnedGalleryOrFail(
    galleryId: number,
    userId: number,
    message = 'Gallery not found',
    galleriesRepository = this.galleriesRepository,
  ): Promise<Gallery> {
    const gallery = await galleriesRepository.findOne({
      where: {
        id: galleryId,
        userId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(message);
    }

    return gallery;
  }

  private async countImagesInGallery(
    galleryId: number,
    imagesRepository = this.imagesRepository,
  ): Promise<number> {
    return imagesRepository.count({
      where: {
        galleryId,
      },
    });
  }

  private async ensureGalleryCanAcceptImages(
    galleryId: number,
    imagesToAddCount: number,
    imagesRepository = this.imagesRepository,
  ): Promise<void> {
    const currentImagesCount = await this.countImagesInGallery(
      galleryId,
      imagesRepository,
    );

    if (currentImagesCount + imagesToAddCount > MAX_IMAGES_PER_GALLERY) {
      throw new BadRequestException(
        `Gallery cannot contain more than ${MAX_IMAGES_PER_GALLERY} images`,
      );
    }
  }

  private ensureImagesAreNotInGallery(
    images: GalleryImage[],
    targetGalleryId: number,
  ): void {
    const hasImagesAlreadyInTargetGallery = images.some(
      (image) => image.galleryId === targetGalleryId,
    );

    if (hasImagesAlreadyInTargetGallery) {
      throw new BadRequestException(
        'One or more images already belong to target gallery',
      );
    }
  }
}
