import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, ILike, In, Repository } from 'typeorm';

import { GalleryImage } from '../images/entities/image.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { GalleryAccess } from './entities/gallery-access.entity';
import { Gallery } from './entities/gallery.entity';
import { GalleryRole } from './enums/gallery-role.enum';
import { GalleriesService } from './galleries.service';
import { removeStoredImageFile } from '../images/images-storage.utils';
import { User } from '../users/entities/user.entity';

jest.mock('../images/images-storage.utils', () => ({
  removeStoredImageFile: jest.fn(),
}));

describe('GalleriesService', () => {
  let galleriesService: GalleriesService;

  let galleriesRepositoryMock: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let galleryAccessRepositoryMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let imagesRepositoryMock: {
    find: jest.Mock;
  };
  let usersRepositoryMock: {
    findOne: jest.Mock;
  };

  let dataSourceMock: {
    transaction: jest.Mock;
  };

  beforeEach(() => {
    galleriesRepositoryMock = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    galleryAccessRepositoryMock = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    imagesRepositoryMock = {
      find: jest.fn(),
    };

    usersRepositoryMock = {
      findOne: jest.fn(),
    };

    dataSourceMock = {
      transaction: jest.fn(),
    };

    galleriesService = new GalleriesService(
      galleriesRepositoryMock as unknown as Repository<Gallery>,
      galleryAccessRepositoryMock as unknown as Repository<GalleryAccess>,
      imagesRepositoryMock as unknown as Repository<GalleryImage>,
      usersRepositoryMock as unknown as Repository<User>,
      dataSourceMock as unknown as DataSource,
    );
  });

  describe('createGallery', () => {
    it('throws ConflictException when gallery title already exists', async () => {
      const userId = 1;

      const dto: CreateGalleryDto = {
        title: 'Nature',
        description: 'Nature photos',
      };

      galleriesRepositoryMock.findOne.mockResolvedValue({
        id: 10,
        userId,
        title: dto.title,
      });

      const createPromise = galleriesService.createGallery(userId, dto);

      await expect(createPromise).rejects.toBeInstanceOf(ConflictException);

      await expect(createPromise).rejects.toThrow(
        'Gallery with this title already exists',
      );

      expect(galleriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          title: dto.title,
        },
      });

      expect(galleriesRepositoryMock.create).not.toHaveBeenCalled();

      expect(galleriesRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('creates and saves gallery when title is available', async () => {
      const userId = 1;

      const dto: CreateGalleryDto = {
        title: 'Nature',
        description: 'Nature photos',
      };

      const gallery = {
        id: 10,
        userId,
        ...dto,
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(null);

      galleriesRepositoryMock.create.mockReturnValue(gallery);

      galleriesRepositoryMock.save.mockResolvedValue(gallery);

      const result = await galleriesService.createGallery(userId, dto);

      expect(galleriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          title: dto.title,
        },
      });

      expect(galleriesRepositoryMock.create).toHaveBeenCalledWith({
        ...dto,
        userId,
      });

      expect(galleriesRepositoryMock.save).toHaveBeenCalledWith(gallery);

      expect(result).toEqual({
        ...gallery,
        role: GalleryRole.OWNER,
      });
    });
  });

  describe('findAll', () => {
    it('returns empty list with default pagination when user has no galleries', async () => {
      galleriesRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

      const result = await galleriesService.findAll(1, {});

      expect(galleriesRepositoryMock.findAndCount).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        order: {
          createdAt: 'DESC',
        },
        skip: 0,
        take: 10,
      });

      expect(imagesRepositoryMock.find).not.toHaveBeenCalled();

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('uses search, sorting and pagination from query', async () => {
      galleriesRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

      const result = await galleriesService.findAll(1, {
        page: 2,
        limit: 5,
        sortBy: 'title',
        sortOrder: 'ASC',
        search: '  Nature  ',
      });

      expect(galleriesRepositoryMock.findAndCount).toHaveBeenCalledWith({
        where: {
          userId: 1,
          title: ILike('%Nature%'),
        },
        order: {
          title: 'ASC',
        },
        skip: 5,
        take: 5,
      });

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 2,
        limit: 5,
      });
    });

    it('includes shared galleries and uses access role for shared items', async () => {
      const ownedGallery = {
        id: 10,
        userId: 1,
        title: 'Owned gallery',
        description: 'Owned photos',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const sharedGallery = {
        id: 20,
        userId: 2,
        title: 'Shared gallery',
        description: 'Shared photos',
        createdAt: new Date('2026-06-04T10:00:00.000Z'),
      };

      galleryAccessRepositoryMock.find.mockResolvedValue([
        {
          galleryId: sharedGallery.id,
          role: GalleryRole.VIEWER,
        },
      ]);

      galleriesRepositoryMock.findAndCount.mockResolvedValue([
        [ownedGallery, sharedGallery],
        2,
      ]);

      imagesRepositoryMock.find.mockResolvedValue([]);

      const result = await galleriesService.findAll(1, {});

      expect(galleriesRepositoryMock.findAndCount).toHaveBeenCalledWith({
        where: [
          {
            userId: 1,
          },
          {
            id: In([20]),
          },
        ],
        order: {
          createdAt: 'DESC',
        },
        skip: 0,
        take: 10,
      });

      expect(result.items).toEqual([
        {
          ...ownedGallery,
          role: GalleryRole.OWNER,
          photosCount: 0,
          previewImages: [],
        },
        {
          ...sharedGallery,
          role: GalleryRole.VIEWER,
          photosCount: 0,
          previewImages: [],
        },
      ]);
    });

    it('adds photos count and preview images to galleries', async () => {
      const galleries = [
        {
          id: 10,
          userId: 1,
          title: 'Nature',
          description: 'Nature photos',
          createdAt: new Date('2026-06-03T10:00:00.000Z'),
        },
        {
          id: 20,
          userId: 1,
          title: 'Travel',
          description: 'Travel photos',
          createdAt: new Date('2026-06-04T10:00:00.000Z'),
        },
      ];

      const natureImages = Array.from({ length: 9 }, (_, index) => ({
        id: index + 1,
        galleryId: 10,
        path: `/uploads/nature-${index + 1}.jpg`,
      }));

      const travelImages = [
        {
          id: 100,
          galleryId: 20,
          path: '/uploads/travel-1.jpg',
        },
      ];

      galleriesRepositoryMock.findAndCount.mockResolvedValue([galleries, 2]);

      imagesRepositoryMock.find.mockResolvedValue([
        ...natureImages,
        ...travelImages,
      ]);

      const result = await galleriesService.findAll(1, {});

      expect(imagesRepositoryMock.find).toHaveBeenCalledWith({
        select: {
          id: true,
          galleryId: true,
          path: true,
        },
        where: {
          galleryId: In([10, 20]),
        },
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual({
        items: [
          {
            ...galleries[0],
            role: GalleryRole.OWNER,
            photosCount: 9,
            previewImages: natureImages.slice(0, 8).map(({ id, path }) => ({
              id,
              path,
            })),
          },
          {
            ...galleries[1],
            role: GalleryRole.OWNER,
            photosCount: 1,
            previewImages: [
              {
                id: 100,
                path: '/uploads/travel-1.jpg',
              },
            ],
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('returns zero photos and empty preview when gallery has no images', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Empty gallery',
        description: null,
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      galleriesRepositoryMock.findAndCount.mockResolvedValue([[gallery], 1]);

      imagesRepositoryMock.find.mockResolvedValue([]);

      const result = await galleriesService.findAll(1, {});

      expect(result).toEqual({
        items: [
          {
            ...gallery,
            role: GalleryRole.OWNER,
            photosCount: 0,
            previewImages: [],
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findById', () => {
    it('returns gallery when it exists and belongs to user', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Nature',
        description: 'Nature photos',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      const result = await galleriesService.findById(10, 1);

      expect(galleriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
      });

      expect(result).toEqual({
        ...gallery,
        role: GalleryRole.OWNER,
      });
    });

    it('throws NotFoundException when gallery does not exist', async () => {
      galleriesRepositoryMock.findOne.mockResolvedValue(null);

      const findPromise = galleriesService.findById(999, 1);

      await expect(findPromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(findPromise).rejects.toThrow('Gallery not found');

      expect(galleriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
    });

    it('returns shared gallery with access role', async () => {
      const gallery = {
        id: 10,
        userId: 2,
        title: 'Shared',
        description: 'Shared photos',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      galleryAccessRepositoryMock.findOne.mockResolvedValue({
        role: GalleryRole.EDITOR,
      });

      const result = await galleriesService.findById(10, 1);

      expect(galleryAccessRepositoryMock.findOne).toHaveBeenCalledWith({
        select: {
          role: true,
        },
        where: {
          galleryId: 10,
          userId: 1,
        },
      });

      expect(result).toEqual({
        ...gallery,
        role: GalleryRole.EDITOR,
      });
    });
  });

  describe('updateGallery', () => {
    it('updates gallery description', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Nature',
        description: 'Old description',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        description: 'Updated description',
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      galleriesRepositoryMock.save.mockResolvedValue(gallery);

      const result = await galleriesService.updateGallery(10, 1, dto);

      expect(galleriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
      });

      expect(galleriesRepositoryMock.findOne).toHaveBeenCalledTimes(1);

      expect(gallery.description).toBe('Updated description');

      expect(galleriesRepositoryMock.save).toHaveBeenCalledWith(gallery);

      expect(result).toEqual({
        ...gallery,
        role: GalleryRole.OWNER,
      });
    });

    it('throws ConflictException when new title already exists', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Nature',
        description: 'Nature photos',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        title: 'Travel',
      };

      galleriesRepositoryMock.findOne
        .mockResolvedValueOnce(gallery)
        .mockResolvedValueOnce({
          id: 20,
          userId: 1,
          title: dto.title,
        });

      const updatePromise = galleriesService.updateGallery(10, 1, dto);

      await expect(updatePromise).rejects.toBeInstanceOf(ConflictException);

      await expect(updatePromise).rejects.toThrow(
        'Gallery with this title already exists',
      );

      expect(galleriesRepositoryMock.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          id: 10,
        },
      });

      expect(galleriesRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          userId: 1,
          title: dto.title,
        },
      });

      expect(galleriesRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('updates title when new title is available', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Nature',
        description: 'Nature photos',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        title: 'Travel',
      };

      galleriesRepositoryMock.findOne
        .mockResolvedValueOnce(gallery)
        .mockResolvedValueOnce(null);

      galleriesRepositoryMock.save.mockResolvedValue(gallery);

      const result = await galleriesService.updateGallery(10, 1, dto);

      expect(galleriesRepositoryMock.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          id: 10,
        },
      });

      expect(galleriesRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          userId: 1,
          title: dto.title,
        },
      });

      expect(gallery.title).toBe('Travel');

      expect(galleriesRepositoryMock.save).toHaveBeenCalledWith(gallery);

      expect(result).toEqual({
        ...gallery,
        role: GalleryRole.OWNER,
      });
    });

    it('updates gallery when user has editor access', async () => {
      const gallery = {
        id: 10,
        userId: 2,
        title: 'Shared gallery',
        description: 'Old description',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        description: 'Updated by editor',
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      galleryAccessRepositoryMock.findOne.mockResolvedValue({
        role: GalleryRole.EDITOR,
      });

      galleriesRepositoryMock.save.mockResolvedValue(gallery);

      const result = await galleriesService.updateGallery(10, 1, dto);

      expect(galleryAccessRepositoryMock.findOne).toHaveBeenCalledWith({
        select: {
          role: true,
        },
        where: {
          galleryId: 10,
          userId: 1,
        },
      });

      expect(gallery.description).toBe('Updated by editor');

      expect(result).toEqual({
        ...gallery,
        role: GalleryRole.EDITOR,
      });
    });

    it('throws ForbiddenException when viewer tries to update gallery', async () => {
      const gallery = {
        id: 10,
        userId: 2,
        title: 'Shared gallery',
        description: 'Shared photos',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      galleryAccessRepositoryMock.findOne.mockResolvedValue({
        role: GalleryRole.VIEWER,
      });

      const updatePromise = galleriesService.updateGallery(10, 1, {
        description: 'Updated by viewer',
      });

      await expect(updatePromise).rejects.toBeInstanceOf(ForbiddenException);

      await expect(updatePromise).rejects.toThrow(
        'You do not have permission to edit this gallery',
      );

      expect(galleriesRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('checks updated title against gallery owner titles for editor updates', async () => {
      const gallery = {
        id: 10,
        userId: 2,
        title: 'Shared gallery',
        description: 'Shared photos',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        title: 'Travel',
      };

      galleriesRepositoryMock.findOne
        .mockResolvedValueOnce(gallery)
        .mockResolvedValueOnce(null);

      galleryAccessRepositoryMock.findOne.mockResolvedValue({
        role: GalleryRole.EDITOR,
      });

      galleriesRepositoryMock.save.mockResolvedValue(gallery);

      await galleriesService.updateGallery(10, 1, dto);

      expect(galleriesRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          userId: 2,
          title: dto.title,
        },
      });
    });
  });

  describe('removeGallery', () => {
    let galleryQueryBuilderMock: {
      setLock: jest.Mock;
      where: jest.Mock;
      andWhere: jest.Mock;
      getOne: jest.Mock;
    };

    let transactionGalleriesRepositoryMock: {
      createQueryBuilder: jest.Mock;
      remove: jest.Mock;
    };

    let transactionImagesRepositoryMock: {
      find: jest.Mock;
    };

    let managerMock: {
      getRepository: jest.Mock;
    };

    beforeEach(() => {
      galleryQueryBuilderMock = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      };

      transactionGalleriesRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue(galleryQueryBuilderMock),
        remove: jest.fn(),
      };

      transactionImagesRepositoryMock = {
        find: jest.fn(),
      };

      managerMock = {
        getRepository: jest.fn((entity: unknown) => {
          if (entity === Gallery) {
            return transactionGalleriesRepositoryMock;
          }

          if (entity === GalleryImage) {
            return transactionImagesRepositoryMock;
          }

          throw new Error('Unexpected repository');
        }),
      };

      dataSourceMock.transaction.mockImplementation(
        async (callback: (manager: typeof managerMock) => Promise<unknown>) =>
          callback(managerMock),
      );

      (removeStoredImageFile as jest.Mock).mockReset();
      (removeStoredImageFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('throws NotFoundException when gallery does not exist', async () => {
      galleriesRepositoryMock.findOne.mockResolvedValue(null);

      const removePromise = galleriesService.removeGallery(999, 1);

      await expect(removePromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(removePromise).rejects.toThrow('Gallery not found');

      expect(dataSourceMock.transaction).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.find).not.toHaveBeenCalled();

      expect(transactionGalleriesRepositoryMock.remove).not.toHaveBeenCalled();

      expect(removeStoredImageFile).not.toHaveBeenCalled();
    });

    it('removes gallery and stored image files', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Nature',
      };

      const images = [
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/nature-1.jpg',
        },
        {
          id: 200,
          galleryId: 10,
          path: '/uploads/nature-2.jpg',
        },
      ];

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      galleryQueryBuilderMock.getOne.mockResolvedValue(gallery);

      transactionImagesRepositoryMock.find.mockResolvedValue(images);

      transactionGalleriesRepositoryMock.remove.mockResolvedValue(gallery);

      await galleriesService.removeGallery(10, 1);

      expect(galleryQueryBuilderMock.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );

      expect(transactionImagesRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          galleryId: 10,
        },
      });

      expect(transactionGalleriesRepositoryMock.remove).toHaveBeenCalledWith(
        gallery,
      );

      expect(removeStoredImageFile).toHaveBeenCalledTimes(2);

      expect(removeStoredImageFile).toHaveBeenNthCalledWith(
        1,
        '/uploads/nature-1.jpg',
      );

      expect(removeStoredImageFile).toHaveBeenNthCalledWith(
        2,
        '/uploads/nature-2.jpg',
      );
    });

    it('removes gallery without deleting files when gallery has no images', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Empty gallery',
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      galleryQueryBuilderMock.getOne.mockResolvedValue(gallery);

      transactionImagesRepositoryMock.find.mockResolvedValue([]);

      transactionGalleriesRepositoryMock.remove.mockResolvedValue(gallery);

      await galleriesService.removeGallery(10, 1);

      expect(transactionGalleriesRepositoryMock.remove).toHaveBeenCalledWith(
        gallery,
      );

      expect(removeStoredImageFile).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when non-owner tries to remove gallery', async () => {
      const gallery = {
        id: 10,
        userId: 2,
        title: 'Shared gallery',
      };

      galleriesRepositoryMock.findOne.mockResolvedValue(gallery);

      galleryAccessRepositoryMock.findOne.mockResolvedValue({
        role: GalleryRole.EDITOR,
      });

      const removePromise = galleriesService.removeGallery(10, 1);

      await expect(removePromise).rejects.toBeInstanceOf(ForbiddenException);

      await expect(removePromise).rejects.toThrow(
        'Only the gallery owner can delete this gallery',
      );

      expect(dataSourceMock.transaction).not.toHaveBeenCalled();
    });
  });
});
