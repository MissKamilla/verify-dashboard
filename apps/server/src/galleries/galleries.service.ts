import { createHash, randomBytes } from 'crypto';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  In,
  MoreThan,
  Repository,
} from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateGalleryDto } from './dto/create-gallery.dto';
import {
  CreateGalleryAccessDto,
  CreateGalleryAccessResponseDto,
  UpdateGalleryAccessDto,
} from './dto/gallery-access.dto';
import { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { GalleryListItemResponseDto } from './dto/gallery-list-item-response.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryResponseDto } from './dto/gallery-response.dto';
import { GalleryRole, GalleryAccessRole } from './enums/gallery-role.enum';
import { Gallery } from './entities/gallery.entity';
import { GalleryAccess } from './entities/gallery-access.entity';
import { GalleryInvitation } from './entities/gallery-invitation.entity';
import { MailService } from '../mail/mail.service';
import { GalleryImage } from '../images/entities/image.entity';
import { removeStoredImageFile } from '../images/images-storage.utils';
import { User } from '../users/entities/user.entity';

const GALLERY_PREVIEW_IMAGES_LIMIT = 8;

type GalleryRoleById = Partial<Record<number, GalleryRole>>;
type ImagesByGalleryId = Partial<Record<number, GalleryImage[]>>;
type GalleryAccessData = {
  sharedGalleryIds: number[];
  roleByGalleryId: GalleryRoleById;
};

type GalleryListOptions = {
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'title';
  sortOrder: 'ASC' | 'DESC';
  search?: string;
};

type GalleryAccessListItem =
  | (GalleryAccess & {
      status: 'active';
    })
  | {
      id: number;
      galleryId: number;
      email: string;
      role: GalleryAccessRole;
      createdAt: Date;
      status: 'pending';
    };

type GalleryListWhere = FindOptionsWhere<Gallery> | FindOptionsWhere<Gallery>[];

type AccessibleGalleryData = {
  gallery: Gallery;
  role: GalleryRole;
};

@Injectable()
export class GalleriesService {
  private readonly logger = new Logger(GalleriesService.name);

  constructor(
    @InjectRepository(Gallery)
    private readonly galleriesRepository: Repository<Gallery>,

    @InjectRepository(GalleryAccess)
    private readonly galleryAccessRepository: Repository<GalleryAccess>,

    @InjectRepository(GalleryImage)
    private readonly imagesRepository: Repository<GalleryImage>,

    @InjectRepository(GalleryInvitation)
    private readonly galleryInvitationRepository: Repository<GalleryInvitation>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly dataSource: DataSource,

    private readonly mailService: MailService,
  ) {}

  async getInvitation(token: string): Promise<{
    email: string;
    galleryTitle: string;
    role: GalleryAccessRole;
  }> {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const invitation = await this.galleryInvitationRepository.findOne({
      where: { tokenHash },
      relations: {
        gallery: true,
      },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation');
    }

    if (invitation.expiresAt < new Date()) {
      await this.galleryInvitationRepository.remove(invitation);

      throw new BadRequestException('Invitation expired');
    }

    return {
      email: invitation.email,
      galleryTitle: invitation.gallery.title,
      role: invitation.role,
    };
  }

  async createGallery(
    userId: number,
    dto: CreateGalleryDto,
  ): Promise<GalleryResponseDto> {
    await this.ensureGalleryTitleIsAvailable(userId, dto.title);

    const gallery = this.galleriesRepository.create({
      ...dto,
      userId,
    });

    const savedGallery = await this.galleriesRepository.save(gallery);

    return this.toGalleryResponse(savedGallery, GalleryRole.OWNER);
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
    const options = this.getGalleryListOptions(query);

    const { sharedGalleryIds, roleByGalleryId } =
      await this.getGalleryAccessData(userId);

    const [galleries, total] = await this.galleriesRepository.findAndCount({
      where: this.getVisibleGalleriesWhere(
        userId,
        sharedGalleryIds,
        options.search,
      ),
      order: {
        [options.sortBy]: options.sortOrder,
      },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    const galleryIds = galleries.map((gallery) => gallery.id);

    const imagesByGalleryId = await this.getImagesByGalleryId(galleryIds);

    const items = galleries.map((gallery) =>
      this.toGalleryListItem(
        gallery,
        userId,
        roleByGalleryId,
        imagesByGalleryId,
      ),
    );

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  async findById(id: number, userId: number): Promise<GalleryResponseDto> {
    const { gallery, role } = await this.getAccessibleGalleryOrThrow(
      id,
      userId,
    );

    return this.toGalleryResponse(gallery, role);
  }

  async updateGallery(
    id: number,
    userId: number,
    dto: UpdateGalleryDto,
  ): Promise<GalleryResponseDto> {
    const { gallery, role } = await this.getEditableGalleryOrThrow(id, userId);

    if (dto.title && dto.title !== gallery.title) {
      await this.ensureGalleryTitleIsAvailable(gallery.userId, dto.title);
    }

    Object.assign(gallery, dto);

    const updatedGallery = await this.galleriesRepository.save(gallery);

    return this.toGalleryResponse(updatedGallery, role);
  }

  async removeGallery(id: number, userId: number): Promise<void> {
    const { role } = await this.getAccessibleGalleryOrThrow(id, userId);

    if (role !== GalleryRole.OWNER) {
      throw new ForbiddenException(
        'Only the gallery owner can delete this gallery',
      );
    }

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
  ): Promise<CreateGalleryAccessResponseDto> {
    const gallery = await this.getOwnedGalleryOrThrow(galleryId, currentUserId);

    const targetUser = await this.usersRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!targetUser) {
      const token = await this.createInvitation(galleryId, dto.email, dto.role);

      await this.mailService.sendGalleryInvitation(
        dto.email,
        gallery.title,
        token,
      );

      return {
        status: 'invitation_sent',
      };
    }

    if (targetUser.id === currentUserId) {
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

    await this.galleryAccessRepository.save(access);

    if (dto.sendNotification) {
      try {
        await this.mailService.sendGallerySharedNotification(
          targetUser.email,
          gallery.title,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send gallery notification for gallery ${galleryId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return {
      status: 'access_granted',
    };
  }

  async findAllAccesses(
    galleryId: number,
    currentUserId: number,
  ): Promise<GalleryAccessListItem[]> {
    await this.getOwnedGalleryOrThrow(galleryId, currentUserId);

    const accesses = await this.galleryAccessRepository.find({
      where: { galleryId },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const invitations = await this.galleryInvitationRepository.find({
      where: {
        galleryId,
        expiresAt: MoreThan(new Date()),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return [
      ...accesses.map((access) => ({
        ...access,
        status: 'active' as const,
      })),

      ...invitations.map((invitation) => ({
        id: invitation.id,
        galleryId: invitation.galleryId,
        email: invitation.email,
        role: invitation.role,
        createdAt: invitation.createdAt,
        status: 'pending' as const,
      })),
    ];
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

  async getAccessibleGalleryOrThrow(
    galleryId: number,
    userId: number,
  ): Promise<AccessibleGalleryData> {
    const gallery = await this.galleriesRepository.findOne({
      where: {
        id: galleryId,
      },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    if (gallery.userId === userId) {
      return {
        gallery,
        role: GalleryRole.OWNER,
      };
    }

    const access = await this.galleryAccessRepository.findOne({
      select: {
        role: true,
      },
      where: {
        galleryId,
        userId,
      },
    });

    if (!access) {
      throw new NotFoundException('Gallery not found');
    }

    return {
      gallery,
      role: access.role,
    };
  }

  async getEditableGalleryOrThrow(
    galleryId: number,
    userId: number,
  ): Promise<AccessibleGalleryData> {
    const accessibleGallery = await this.getAccessibleGalleryOrThrow(
      galleryId,
      userId,
    );

    if (accessibleGallery.role === GalleryRole.VIEWER) {
      throw new ForbiddenException(
        'You do not have permission to edit this gallery',
      );
    }

    return accessibleGallery;
  }

  async checkAccessRecipient(
    galleryId: number,
    currentUserId: number,
    email: string,
  ): Promise<{ registered: boolean }> {
    await this.getOwnedGalleryOrThrow(galleryId, currentUserId);

    const user = await this.usersRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    return {
      registered: Boolean(user),
    };
  }

  private async createInvitation(
    galleryId: number,
    email: string,
    role: GalleryAccessRole,
  ): Promise<string> {
    const token = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    let invitation = await this.galleryInvitationRepository.findOne({
      where: {
        galleryId,
        email,
      },
    });

    if (invitation) {
      invitation.role = role;
      invitation.tokenHash = tokenHash;
      invitation.expiresAt = expiresAt;
    } else {
      invitation = this.galleryInvitationRepository.create({
        galleryId,
        email,
        role,
        tokenHash,
        expiresAt,
      });
    }

    await this.galleryInvitationRepository.save(invitation);

    return token;
  }

  private async getGalleryAccessData(
    userId: number,
  ): Promise<GalleryAccessData> {
    const accesses = await this.galleryAccessRepository.find({
      select: {
        galleryId: true,
        role: true,
      },
      where: {
        userId,
      },
    });

    const sharedGalleryIds = accesses.map((access) => access.galleryId);

    const roleByGalleryId = Object.fromEntries(
      accesses.map((access) => [access.galleryId, access.role]),
    ) as GalleryRoleById;

    return {
      sharedGalleryIds,
      roleByGalleryId,
    };
  }

  private getGalleryListOptions(
    query: GetGalleriesQueryDto,
  ): GalleryListOptions {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'DESC',
      search: query.search?.trim(),
    };
  }

  private getVisibleGalleriesWhere(
    userId: number,
    sharedGalleryIds: number[],
    search?: string,
  ): GalleryListWhere {
    const searchCondition = search
      ? {
          title: ILike(`%${search}%`),
        }
      : {};

    if (sharedGalleryIds.length === 0) {
      return {
        userId,
        ...searchCondition,
      };
    }

    return [
      {
        userId,
        ...searchCondition,
      },
      {
        id: In(sharedGalleryIds),
        ...searchCondition,
      },
    ];
  }

  private async getImagesByGalleryId(
    galleryIds: number[],
  ): Promise<ImagesByGalleryId> {
    if (galleryIds.length === 0) {
      return {};
    }

    const images = await this.imagesRepository.find({
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
    });

    return images.reduce<ImagesByGalleryId>((imagesByGalleryId, image) => {
      const galleryImages = imagesByGalleryId[image.galleryId] ?? [];

      galleryImages.push(image);
      imagesByGalleryId[image.galleryId] = galleryImages;

      return imagesByGalleryId;
    }, {});
  }

  private getGalleryRole(
    gallery: Gallery,
    currentUserId: number,
    roleByGalleryId: GalleryRoleById,
  ): GalleryRole {
    if (gallery.userId === currentUserId) {
      return GalleryRole.OWNER;
    }

    const role = roleByGalleryId[gallery.id];

    if (!role) {
      throw new NotFoundException('Gallery access not found');
    }

    return role;
  }

  private toGalleryListItem(
    gallery: Gallery,
    currentUserId: number,
    roleByGalleryId: GalleryRoleById,
    imagesByGalleryId: ImagesByGalleryId,
  ): GalleryListItemResponseDto {
    const galleryImages = imagesByGalleryId[gallery.id] ?? [];
    const role = this.getGalleryRole(gallery, currentUserId, roleByGalleryId);

    return {
      ...this.toGalleryResponse(gallery, role),
      photosCount: galleryImages.length,
      previewImages: galleryImages
        .slice(0, GALLERY_PREVIEW_IMAGES_LIMIT)
        .map(({ id, path }) => ({
          id,
          path,
        })),
    };
  }

  private toGalleryResponse(
    gallery: Gallery,
    role: GalleryRole,
  ): GalleryResponseDto {
    return {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      userId: gallery.userId,
      createdAt: gallery.createdAt,
      role,
    };
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

  private async ensureGalleryTitleIsAvailable(
    userId: number,
    title: string,
  ): Promise<void> {
    const existingGallery = await this.galleriesRepository.findOne({
      where: {
        userId,
        title,
      },
    });

    if (existingGallery) {
      throw new ConflictException('Gallery with this title already exists');
    }
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
