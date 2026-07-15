import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import {
  CreateGalleryAccessDto,
  UpdateGalleryAccessDto,
} from './dto/gallery-access.dto';
import { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { GalleryListItemResponseDto } from './dto/gallery-list-item-response.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryAccess } from './entities/gallery-access.entity';
import { GalleryImage } from '../images/entities/image.entity';
import { removeStoredImageFile } from '../images/images-storage.utils';
import { User } from '../users/entities/user.entity';

const GALLERY_PREVIEW_IMAGES_LIMIT = 8;

@Injectable()
export class GalleriesService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleriesRepository: Repository<Gallery>,

    @InjectRepository(GalleryAccess)
    private readonly galleryAccessRepository: Repository<GalleryAccess>,

    @InjectRepository(GalleryImage)
    private readonly imagesRepository: Repository<GalleryImage>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async createGallery(userId: number, dto: CreateGalleryDto): Promise<Gallery> {
    const existingGallery = await this.galleriesRepository.findOne({
      where: {
        userId,
        title: dto.title,
      },
    });

    if (existingGallery) {
      throw new ConflictException('Gallery with this title already exists');
    }

    const gallery = this.galleriesRepository.create({
      ...dto,
      userId,
    });

    return this.galleriesRepository.save(gallery);
  }

  async findAll(
    userId: number,
    query: GetGalleriesQueryDto,
  ): Promise<{
    items: GalleryListItemResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    const search = query.search?.trim();

    const [galleries, total] = await this.galleriesRepository.findAndCount({
      where: {
        userId,
        ...(search ? { title: ILike(`%${search}%`) } : {}),
      },
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const galleryIds = galleries.map((gallery) => gallery.id);

    const images =
      galleryIds.length > 0
        ? await this.imagesRepository.find({
            select: {
              id: true,
              galleryId: true,
              path: true,
            },
            where: {
              galleryId: In(galleryIds),
            },
            order: {
              createdAt: 'DESC',
            },
          })
        : [];

    const imagesByGalleryId = new Map<number, GalleryImage[]>();

    images.forEach((image) => {
      const galleryImages = imagesByGalleryId.get(image.galleryId) ?? [];

      galleryImages.push(image);
      imagesByGalleryId.set(image.galleryId, galleryImages);
    });

    const items = galleries.map((gallery) => {
      const galleryImages = imagesByGalleryId.get(gallery.id) ?? [];

      return {
        ...gallery,
        photosCount: galleryImages.length,
        previewImages: galleryImages
          .slice(0, GALLERY_PREVIEW_IMAGES_LIMIT)
          .map(({ id, path }) => ({
            id,
            path,
          })),
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findById(id: number, userId: number): Promise<Gallery> {
    const gallery = await this.galleriesRepository.findOne({
      where: { id, userId },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return gallery;
  }

  async updateGallery(
    id: number,
    userId: number,
    dto: UpdateGalleryDto,
  ): Promise<Gallery> {
    const gallery = await this.findById(id, userId);

    if (dto.title && dto.title !== gallery.title) {
      const existingGallery = await this.galleriesRepository.findOne({
        where: {
          userId,
          title: dto.title,
        },
      });

      if (existingGallery) {
        throw new ConflictException('Gallery with this title already exists');
      }
    }

    Object.assign(gallery, dto);

    return this.galleriesRepository.save(gallery);
  }

  async removeGallery(id: number, userId: number): Promise<void> {
    const imagePaths = await this.dataSource.transaction(async (manager) => {
      const galleriesRepository = manager.getRepository(Gallery);
      const imagesRepository = manager.getRepository(GalleryImage);

      const gallery = await galleriesRepository
        .createQueryBuilder('gallery')
        .setLock('pessimistic_write')
        .where('gallery.id = :id', { id })
        .andWhere('gallery.userId = :userId', { userId })
        .getOne();

      if (!gallery) {
        throw new NotFoundException('Gallery not found');
      }

      const images = await imagesRepository.find({
        where: {
          galleryId: id,
        },
      });

      await galleriesRepository.remove(gallery);

      return images.map((image) => image.path);
    });

    await Promise.all(
      imagePaths.map((imagePath) => removeStoredImageFile(imagePath)),
    );
  }

  async createAccess(
    galleryId: number,
    currentUserId: number,
    dto: CreateGalleryAccessDto,
  ): Promise<GalleryAccess> {
    await this.getOwnedGalleryOrThrow(galleryId, currentUserId);

    const targetUser = await this.usersRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.id === Number(currentUserId)) {
      throw new BadRequestException('You cannot share a gallery with yourself');
    }

    const existingAccess = await this.galleryAccessRepository.findOne({
      where: {
        galleryId,
        userId: targetUser.id,
      },
    });

    if (existingAccess) {
      throw new ConflictException('User already has access to this gallery');
    }

    const access = this.galleryAccessRepository.create({
      galleryId,
      userId: targetUser.id,
      role: dto.role,
    });

    return this.galleryAccessRepository.save(access);
  }

  async findAllAccesses(
    galleryId: number,
    currentUserId: number,
  ): Promise<GalleryAccess[]> {
    await this.getOwnedGalleryOrThrow(galleryId, currentUserId);

    return this.galleryAccessRepository.find({
      where: {
        galleryId,
      },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async updateAccess(
    galleryId: number,
    targetUserId: number,
    currentUserId: number,
    dto: UpdateGalleryAccessDto,
  ): Promise<GalleryAccess> {
    await this.getOwnedGalleryOrThrow(galleryId, currentUserId);

    const access = await this.getAccessOrThrow(galleryId, targetUserId);

    access.role = dto.role;

    return this.galleryAccessRepository.save(access);
  }

  async removeAccess(
    galleryId: number,
    targetUserId: number,
    currentUserId: number,
  ): Promise<void> {
    await this.getOwnedGalleryOrThrow(galleryId, currentUserId);

    const access = await this.getAccessOrThrow(galleryId, targetUserId);

    await this.galleryAccessRepository.remove(access);
  }

  private async getOwnedGalleryOrThrow(
    galleryId: number,
    userId: number,
  ): Promise<Gallery> {
    const gallery = await this.galleriesRepository.findOne({
      where: {
        id: galleryId,
        userId,
      },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return gallery;
  }

  private async getAccessOrThrow(
    galleryId: number,
    userId: number,
  ): Promise<GalleryAccess> {
    const access = await this.galleryAccessRepository.findOne({
      where: {
        galleryId,
        userId,
      },
    });

    if (!access) {
      throw new NotFoundException('Gallery access not found');
    }

    return access;
  }
}
