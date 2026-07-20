import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';

import { Gallery } from '../galleries/entities/gallery.entity';
import type { GalleriesService } from '../galleries/galleries.service';
import { GalleryImage } from './entities/image.entity';
import { ImagesService } from './images.service';
import {
  copyStoredImageFile,
  removeStoredImageFile,
  removeUploadedFiles,
} from './images-storage.utils';

jest.mock('./images-storage.utils', () => {
  const actualImagesStorageUtils = jest.requireActual<
    typeof import('./images-storage.utils')
  >('./images-storage.utils');

  return {
    ...actualImagesStorageUtils,
    copyStoredImageFile: jest.fn(),
    removeStoredImageFile: jest.fn(),
    removeUploadedFiles: jest.fn(),
  };
});

describe('ImagesService', () => {
  let imagesService: ImagesService;

  let imagesRepositoryMock: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    save: jest.Mock;
  };

  let galleriesServiceMock: {
    getAccessibleGalleryOrThrow: jest.Mock;
    getEditableGalleryOrThrow: jest.Mock;
  };

  let dataSourceMock: {
    transaction: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    imagesRepositoryMock = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
    };

    galleriesServiceMock = {
      getAccessibleGalleryOrThrow: jest.fn().mockResolvedValue({
        gallery: {
          id: 10,
          userId: 1,
          title: 'Nature',
        },
        role: 'owner',
      }),
      getEditableGalleryOrThrow: jest.fn().mockResolvedValue({
        gallery: {
          id: 10,
          userId: 1,
          title: 'Nature',
        },
        role: 'owner',
      }),
    };

    dataSourceMock = {
      transaction: jest.fn(),
    };

    imagesService = new ImagesService(
      imagesRepositoryMock as unknown as Repository<GalleryImage>,
      galleriesServiceMock as unknown as GalleriesService,
      dataSourceMock as unknown as DataSource,
    );
  });

  describe('findByGallery', () => {
    it('returns images with default pagination', async () => {
      const images = [
        {
          id: 1,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
        {
          id: 2,
          galleryId: 10,
          path: '/uploads/images/nature-2.jpg',
        },
      ];

      imagesRepositoryMock.findAndCount.mockResolvedValue([images, 2]);

      const result = await imagesService.findByGallery(10, 1, {});

      expect(
        galleriesServiceMock.getAccessibleGalleryOrThrow,
      ).toHaveBeenCalledWith(10, 1);

      expect(imagesRepositoryMock.findAndCount).toHaveBeenCalledWith({
        where: {
          galleryId: 10,
        },
        order: {
          createdAt: 'DESC',
          id: 'DESC',
        },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        items: images,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('uses pagination from query', async () => {
      imagesRepositoryMock.findAndCount.mockResolvedValue([[], 12]);

      const result = await imagesService.findByGallery(10, 1, {
        page: 3,
        limit: 5,
      });

      expect(imagesRepositoryMock.findAndCount).toHaveBeenCalledWith({
        where: {
          galleryId: 10,
        },
        order: {
          createdAt: 'DESC',
          id: 'DESC',
        },
        skip: 10,
        take: 5,
      });

      expect(result).toEqual({
        items: [],
        total: 12,
        page: 3,
        limit: 5,
      });
    });

    it('throws NotFoundException when gallery does not exist', async () => {
      galleriesServiceMock.getAccessibleGalleryOrThrow.mockRejectedValue(
        new NotFoundException('Gallery not found'),
      );

      const findPromise = imagesService.findByGallery(999, 1, {});

      await expect(findPromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(findPromise).rejects.toThrow('Gallery not found');

      expect(
        galleriesServiceMock.getAccessibleGalleryOrThrow,
      ).toHaveBeenCalledWith(999, 1);

      expect(imagesRepositoryMock.findAndCount).not.toHaveBeenCalled();
    });

    it('returns images when shared gallery is accessible', async () => {
      galleriesServiceMock.getAccessibleGalleryOrThrow.mockResolvedValue({
        gallery: {
          id: 10,
          userId: 2,
          title: 'Shared gallery',
        },
        role: 'viewer',
      });

      imagesRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

      await imagesService.findByGallery(10, 1, {});

      expect(imagesRepositoryMock.findAndCount).toHaveBeenCalled();
    });
  });

  describe('uploadToGallery', () => {
    let galleryQueryBuilderMock: {
      setLock: jest.Mock;
      where: jest.Mock;
      andWhere: jest.Mock;
      getOne: jest.Mock;
    };

    let transactionImagesRepositoryMock: {
      count: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
    };

    let transactionGalleriesRepositoryMock: {
      createQueryBuilder: jest.Mock;
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

      transactionImagesRepositoryMock = {
        count: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      transactionGalleriesRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue(galleryQueryBuilderMock),
      };

      managerMock = {
        getRepository: jest.fn((entity: unknown) => {
          if (entity === GalleryImage) {
            return transactionImagesRepositoryMock;
          }

          if (entity === Gallery) {
            return transactionGalleriesRepositoryMock;
          }

          throw new Error('Unexpected repository');
        }),
      };

      dataSourceMock.transaction.mockImplementation(
        async (callback: (manager: typeof managerMock) => Promise<unknown>) =>
          callback(managerMock),
      );
    });

    it('uploads image with empty metafields when metafields are not provided', async () => {
      const files = [
        {
          path: '/tmp/lake.jpg',
          filename: 'lake.jpg',
          originalname: 'summer-lake.jpg',
        },
      ];

      const createdImage = {
        id: 100,
        path: '/uploads/images/lake.jpg',
        galleryId: 10,
        originalFilename: 'summer-lake.jpg',
        metafields: {},
      };

      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 10,
        userId: 1,
        title: 'Nature',
      });

      transactionImagesRepositoryMock.count.mockResolvedValue(3);

      transactionImagesRepositoryMock.create.mockReturnValue(createdImage);

      transactionImagesRepositoryMock.save.mockResolvedValue([createdImage]);

      const result = await imagesService.uploadToGallery(10, 1, files);

      expect(transactionImagesRepositoryMock.count).toHaveBeenCalledWith({
        where: {
          galleryId: 10,
        },
      });

      expect(transactionImagesRepositoryMock.create).toHaveBeenCalledWith({
        path: '/uploads/images/lake.jpg',
        galleryId: 10,
        originalFilename: 'summer-lake.jpg',
        metafields: {},
      });

      expect(transactionImagesRepositoryMock.save).toHaveBeenCalledWith([
        createdImage,
      ]);

      expect(removeUploadedFiles).not.toHaveBeenCalled();

      expect(result).toEqual([createdImage]);
    });

    it('maps metafields to uploaded images by file index', async () => {
      const files = [
        {
          path: '/tmp/lake.jpg',
          filename: 'lake.jpg',
          originalname: 'summer-lake.jpg',
        },
        {
          path: '/tmp/forest.jpg',
          filename: 'forest.jpg',
          originalname: 'green-forest.jpg',
        },
      ];

      const metafields = [
        {
          name: 'Lake',
          comment: 'Summer photo',
        },
        {
          name: 'Forest',
          comment: 'Morning photo',
        },
      ];

      const createdImages = [
        {
          id: 100,
          path: '/uploads/images/lake.jpg',
          galleryId: 10,
          originalFilename: 'summer-lake.jpg',
          metafields: metafields[0],
        },
        {
          id: 200,
          path: '/uploads/images/forest.jpg',
          galleryId: 10,
          originalFilename: 'green-forest.jpg',
          metafields: metafields[1],
        },
      ];

      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 10,
        userId: 1,
        title: 'Nature',
      });

      transactionImagesRepositoryMock.count.mockResolvedValue(0);

      transactionImagesRepositoryMock.create
        .mockReturnValueOnce(createdImages[0])
        .mockReturnValueOnce(createdImages[1]);

      transactionImagesRepositoryMock.save.mockResolvedValue(createdImages);

      const result = await imagesService.uploadToGallery(
        10,
        1,
        files,
        metafields,
      );

      expect(transactionImagesRepositoryMock.create).toHaveBeenNthCalledWith(
        1,
        {
          path: '/uploads/images/lake.jpg',
          galleryId: 10,
          originalFilename: 'summer-lake.jpg',
          metafields: {
            name: 'Lake',
            comment: 'Summer photo',
          },
        },
      );

      expect(transactionImagesRepositoryMock.create).toHaveBeenNthCalledWith(
        2,
        {
          path: '/uploads/images/forest.jpg',
          galleryId: 10,
          originalFilename: 'green-forest.jpg',
          metafields: {
            name: 'Forest',
            comment: 'Morning photo',
          },
        },
      );

      expect(transactionImagesRepositoryMock.save).toHaveBeenCalledWith(
        createdImages,
      );

      expect(removeUploadedFiles).not.toHaveBeenCalled();

      expect(result).toEqual(createdImages);
    });

    it('throws BadRequestException and removes uploaded files when metafields count does not match files count', async () => {
      const files = [
        {
          path: '/tmp/lake.jpg',
          filename: 'lake.jpg',
          originalname: 'summer-lake.jpg',
        },
        {
          path: '/tmp/forest.jpg',
          filename: 'forest.jpg',
          originalname: 'green-forest.jpg',
        },
      ];

      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 10,
        userId: 1,
        title: 'Nature',
      });

      transactionImagesRepositoryMock.count.mockResolvedValue(0);

      const uploadPromise = imagesService.uploadToGallery(10, 1, files, [
        {
          name: 'Lake',
        },
      ]);

      await expect(uploadPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(uploadPromise).rejects.toThrow(
        'Metafields count must match uploaded files count',
      );

      expect(transactionImagesRepositoryMock.create).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();

      expect(removeUploadedFiles).toHaveBeenCalledWith(files);
    });

    it('throws BadRequestException and removes uploaded files when gallery limit would be exceeded', async () => {
      const files = [
        {
          path: '/tmp/lake.jpg',
          filename: 'lake.jpg',
          originalname: 'summer-lake.jpg',
        },
      ];

      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 10,
        userId: 1,
        title: 'Nature',
      });

      transactionImagesRepositoryMock.count.mockResolvedValue(50);

      const uploadPromise = imagesService.uploadToGallery(10, 1, files);

      await expect(uploadPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(uploadPromise).rejects.toThrow(
        'Gallery cannot contain more than 50 images',
      );

      expect(transactionImagesRepositoryMock.create).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();

      expect(removeUploadedFiles).toHaveBeenCalledWith(files);
    });

    it('throws ForbiddenException and removes uploaded files when user cannot edit gallery', async () => {
      const files = [
        {
          path: '/tmp/lake.jpg',
          filename: 'lake.jpg',
          originalname: 'summer-lake.jpg',
        },
      ];

      galleriesServiceMock.getEditableGalleryOrThrow.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to edit this gallery',
        ),
      );

      const uploadPromise = imagesService.uploadToGallery(10, 1, files);

      await expect(uploadPromise).rejects.toBeInstanceOf(ForbiddenException);

      expect(dataSourceMock.transaction).not.toHaveBeenCalled();

      expect(removeUploadedFiles).toHaveBeenCalledWith(files);
    });
  });

  describe('updateMetafields', () => {
    it('updates image name and preserves existing comment', async () => {
      const image = {
        id: 20,
        galleryId: 10,
        path: '/uploads/images/nature.jpg',
        originalFilename: 'nature.jpg',
        metafields: {
          name: 'Old name',
          comment: 'Existing comment',
        },
      };

      imagesRepositoryMock.findOne.mockResolvedValue(image);

      imagesRepositoryMock.save.mockResolvedValue(image);

      const result = await imagesService.updateMetafields(20, 1, {
        name: 'Updated name',
      });

      expect(imagesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 20,
        },
      });

      expect(imagesRepositoryMock.save).toHaveBeenCalledWith({
        ...image,
        metafields: {
          name: 'Updated name',
          comment: 'Existing comment',
        },
      });

      expect(result).toEqual({
        ...image,
        metafields: {
          name: 'Updated name',
          comment: 'Existing comment',
        },
      });
    });

    it('creates metafields object when image has no metafields', async () => {
      const image = {
        id: 20,
        galleryId: 10,
        path: '/uploads/images/nature.jpg',
        originalFilename: 'nature.jpg',
        metafields: undefined,
      };

      imagesRepositoryMock.findOne.mockResolvedValue(image);

      imagesRepositoryMock.save.mockResolvedValue(image);

      const result = await imagesService.updateMetafields(20, 1, {
        comment: 'New comment',
      });

      expect(imagesRepositoryMock.save).toHaveBeenCalledWith({
        ...image,
        metafields: {
          comment: 'New comment',
        },
      });

      expect(result).toEqual({
        ...image,
        metafields: {
          comment: 'New comment',
        },
      });
    });

    it('throws NotFoundException when image does not exist', async () => {
      imagesRepositoryMock.findOne.mockResolvedValue(null);

      const updatePromise = imagesService.updateMetafields(999, 1, {
        name: 'Updated name',
      });

      await expect(updatePromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(updatePromise).rejects.toThrow('Image not found');

      expect(imagesRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when user cannot edit image gallery', async () => {
      imagesRepositoryMock.findOne.mockResolvedValue({
        id: 20,
        galleryId: 10,
        path: '/uploads/images/nature.jpg',
      });

      galleriesServiceMock.getEditableGalleryOrThrow.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to edit this gallery',
        ),
      );

      const updatePromise = imagesService.updateMetafields(20, 1, {
        name: 'Updated name',
      });

      await expect(updatePromise).rejects.toBeInstanceOf(ForbiddenException);

      expect(imagesRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('moveImages', () => {
    let galleryQueryBuilderMock: {
      setLock: jest.Mock;
      where: jest.Mock;
      andWhere: jest.Mock;
      getOne: jest.Mock;
    };

    let transactionImagesRepositoryMock: {
      find: jest.Mock;
      count: jest.Mock;
      save: jest.Mock;
    };

    let transactionGalleriesRepositoryMock: {
      createQueryBuilder: jest.Mock;
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

      transactionImagesRepositoryMock = {
        find: jest.fn(),
        count: jest.fn(),
        save: jest.fn(),
      };

      transactionGalleriesRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue(galleryQueryBuilderMock),
      };

      managerMock = {
        getRepository: jest.fn((entity: unknown) => {
          if (entity === GalleryImage) {
            return transactionImagesRepositoryMock;
          }

          if (entity === Gallery) {
            return transactionGalleriesRepositoryMock;
          }

          throw new Error('Unexpected repository');
        }),
      };

      dataSourceMock.transaction.mockImplementation(
        async (callback: (manager: typeof managerMock) => Promise<unknown>) =>
          callback(managerMock),
      );
    });

    it('moves images to target gallery', async () => {
      const targetGallery = {
        id: 20,
        userId: 1,
        title: 'Travel',
      };

      const images = [
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
        {
          id: 200,
          galleryId: 10,
          path: '/uploads/images/nature-2.jpg',
        },
      ];

      galleryQueryBuilderMock.getOne.mockResolvedValue(targetGallery);

      transactionImagesRepositoryMock.find.mockResolvedValue(images);

      transactionImagesRepositoryMock.count.mockResolvedValue(3);

      transactionImagesRepositoryMock.save.mockResolvedValue(images);

      const result = await imagesService.moveImages([100, 200], 1, 20);

      expect(galleryQueryBuilderMock.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );

      expect(galleryQueryBuilderMock.where).toHaveBeenCalledWith(
        'gallery.id = :galleryId',
        {
          galleryId: 20,
        },
      );

      expect(transactionImagesRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          id: In([100, 200]),
        },
      });

      expect(transactionImagesRepositoryMock.count).toHaveBeenCalledWith({
        where: {
          galleryId: 20,
        },
      });

      expect(transactionImagesRepositoryMock.save).toHaveBeenCalledWith(images);

      expect(images).toEqual([
        {
          id: 100,
          galleryId: 20,
          path: '/uploads/images/nature-1.jpg',
        },
        {
          id: 200,
          galleryId: 20,
          path: '/uploads/images/nature-2.jpg',
        },
      ]);

      expect(result).toEqual(images);
    });

    it('throws NotFoundException when target gallery does not exist', async () => {
      galleryQueryBuilderMock.getOne.mockResolvedValue(null);

      const movePromise = imagesService.moveImages([100, 200], 1, 999);

      await expect(movePromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(movePromise).rejects.toThrow('Gallery not found');

      expect(galleryQueryBuilderMock.where).toHaveBeenCalledWith(
        'gallery.id = :galleryId',
        {
          galleryId: 999,
        },
      );

      expect(transactionImagesRepositoryMock.find).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.count).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when one or more images do not exist', async () => {
      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 20,
        userId: 1,
        title: 'Travel',
      });

      transactionImagesRepositoryMock.find.mockResolvedValue([
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
      ]);

      const movePromise = imagesService.moveImages([100, 200], 1, 20);

      await expect(movePromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(movePromise).rejects.toThrow('One or more images not found');

      expect(transactionImagesRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          id: In([100, 200]),
        },
      });

      expect(transactionImagesRepositoryMock.count).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when image already belongs to target gallery', async () => {
      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 20,
        userId: 1,
        title: 'Travel',
      });

      transactionImagesRepositoryMock.find.mockResolvedValue([
        {
          id: 100,
          galleryId: 20,
          path: '/uploads/images/travel.jpg',
        },
      ]);

      const movePromise = imagesService.moveImages([100], 1, 20);

      await expect(movePromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(movePromise).rejects.toThrow(
        'One or more images already belong to target gallery',
      );

      expect(transactionImagesRepositoryMock.count).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when target gallery limit would be exceeded', async () => {
      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 20,
        userId: 1,
        title: 'Travel',
      });

      transactionImagesRepositoryMock.find.mockResolvedValue([
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
        {
          id: 200,
          galleryId: 10,
          path: '/uploads/images/nature-2.jpg',
        },
      ]);

      transactionImagesRepositoryMock.count.mockResolvedValue(49);

      const movePromise = imagesService.moveImages([100, 200], 1, 20);

      await expect(movePromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(movePromise).rejects.toThrow(
        'Gallery cannot contain more than 50 images',
      );

      expect(transactionImagesRepositoryMock.count).toHaveBeenCalledWith({
        where: {
          galleryId: 20,
        },
      });

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('copyImages', () => {
    let galleryQueryBuilderMock: {
      setLock: jest.Mock;
      where: jest.Mock;
      andWhere: jest.Mock;
      getOne: jest.Mock;
    };

    let transactionImagesRepositoryMock: {
      find: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
    };

    let transactionGalleriesRepositoryMock: {
      createQueryBuilder: jest.Mock;
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

      transactionImagesRepositoryMock = {
        find: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      transactionGalleriesRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue(galleryQueryBuilderMock),
      };

      managerMock = {
        getRepository: jest.fn((entity: unknown) => {
          if (entity === GalleryImage) {
            return transactionImagesRepositoryMock;
          }

          if (entity === Gallery) {
            return transactionGalleriesRepositoryMock;
          }

          throw new Error('Unexpected repository');
        }),
      };

      dataSourceMock.transaction.mockImplementation(
        async (callback: (manager: typeof managerMock) => Promise<unknown>) =>
          callback(managerMock),
      );
    });

    it('copies images to target gallery', async () => {
      const sourceImages = [
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
          originalFilename: 'nature-1.jpg',
          metafields: {
            name: 'Lake',
            comment: 'Summer photo',
          },
        },
        {
          id: 200,
          galleryId: 10,
          path: '/uploads/images/nature-2.jpg',
          originalFilename: 'nature-2.jpg',
          metafields: undefined,
        },
      ];

      const copiedImages = [
        {
          id: 300,
          galleryId: 20,
          path: '/uploads/images/copied-1.jpg',
          originalFilename: 'nature-1.jpg',
          metafields: {
            name: 'Lake',
            comment: 'Summer photo',
          },
        },
        {
          id: 400,
          galleryId: 20,
          path: '/uploads/images/copied-2.jpg',
          originalFilename: 'nature-2.jpg',
          metafields: {},
        },
      ];

      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 20,
        userId: 1,
        title: 'Travel',
      });

      transactionImagesRepositoryMock.find.mockResolvedValue(sourceImages);

      transactionImagesRepositoryMock.count.mockResolvedValue(3);

      jest
        .mocked(copyStoredImageFile)
        .mockResolvedValueOnce('/uploads/images/copied-1.jpg')
        .mockResolvedValueOnce('/uploads/images/copied-2.jpg');

      transactionImagesRepositoryMock.create
        .mockReturnValueOnce(copiedImages[0])
        .mockReturnValueOnce(copiedImages[1]);

      transactionImagesRepositoryMock.save.mockResolvedValue(copiedImages);

      const result = await imagesService.copyImages([100, 200], 1, 20);

      expect(transactionImagesRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          id: In([100, 200]),
        },
      });

      expect(transactionImagesRepositoryMock.count).toHaveBeenCalledWith({
        where: {
          galleryId: 20,
        },
      });

      expect(copyStoredImageFile).toHaveBeenNthCalledWith(
        1,
        '/uploads/images/nature-1.jpg',
      );

      expect(copyStoredImageFile).toHaveBeenNthCalledWith(
        2,
        '/uploads/images/nature-2.jpg',
      );

      expect(transactionImagesRepositoryMock.create).toHaveBeenNthCalledWith(
        1,
        {
          path: '/uploads/images/copied-1.jpg',
          galleryId: 20,
          originalFilename: 'nature-1.jpg',
          metafields: {
            name: 'Lake',
            comment: 'Summer photo',
          },
        },
      );

      expect(transactionImagesRepositoryMock.create).toHaveBeenNthCalledWith(
        2,
        {
          path: '/uploads/images/copied-2.jpg',
          galleryId: 20,
          originalFilename: 'nature-2.jpg',
          metafields: {},
        },
      );

      expect(transactionImagesRepositoryMock.save).toHaveBeenCalledWith(
        copiedImages,
      );

      expect(removeStoredImageFile).not.toHaveBeenCalled();

      expect(result).toEqual(copiedImages);
    });

    it('throws NotFoundException when one or more source images do not exist', async () => {
      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 20,
        userId: 1,
        title: 'Travel',
      });

      transactionImagesRepositoryMock.find.mockResolvedValue([
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
      ]);

      const copyPromise = imagesService.copyImages([100, 200], 1, 20);

      await expect(copyPromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(copyPromise).rejects.toThrow('One or more images not found');

      expect(transactionImagesRepositoryMock.count).not.toHaveBeenCalled();

      expect(copyStoredImageFile).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.create).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();

      expect(removeStoredImageFile).not.toHaveBeenCalled();
    });

    it('throws BadRequestException without copying files when gallery limit would be exceeded', async () => {
      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 20,
        userId: 1,
        title: 'Travel',
      });

      transactionImagesRepositoryMock.find.mockResolvedValue([
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
      ]);

      transactionImagesRepositoryMock.count.mockResolvedValue(50);

      const copyPromise = imagesService.copyImages([100], 1, 20);

      await expect(copyPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(copyPromise).rejects.toThrow(
        'Gallery cannot contain more than 50 images',
      );

      expect(copyStoredImageFile).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.create).not.toHaveBeenCalled();

      expect(transactionImagesRepositoryMock.save).not.toHaveBeenCalled();

      expect(removeStoredImageFile).not.toHaveBeenCalled();
    });

    it('removes copied files when saving images fails', async () => {
      const sourceImages = [
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
          originalFilename: 'nature-1.jpg',
          metafields: {
            name: 'Lake',
          },
        },
        {
          id: 200,
          galleryId: 10,
          path: '/uploads/images/nature-2.jpg',
          originalFilename: 'nature-2.jpg',
          metafields: {},
        },
      ];

      const copiedImages = [
        {
          galleryId: 20,
          path: '/uploads/images/copied-1.jpg',
          originalFilename: 'nature-1.jpg',
          metafields: {
            name: 'Lake',
          },
        },
        {
          galleryId: 20,
          path: '/uploads/images/copied-2.jpg',
          originalFilename: 'nature-2.jpg',
          metafields: {},
        },
      ];

      galleryQueryBuilderMock.getOne.mockResolvedValue({
        id: 20,
        userId: 1,
        title: 'Travel',
      });

      transactionImagesRepositoryMock.find.mockResolvedValue(sourceImages);

      transactionImagesRepositoryMock.count.mockResolvedValue(0);

      jest
        .mocked(copyStoredImageFile)
        .mockResolvedValueOnce('/uploads/images/copied-1.jpg')
        .mockResolvedValueOnce('/uploads/images/copied-2.jpg');

      transactionImagesRepositoryMock.create
        .mockReturnValueOnce(copiedImages[0])
        .mockReturnValueOnce(copiedImages[1]);

      transactionImagesRepositoryMock.save.mockRejectedValue(
        new Error('Database error'),
      );

      const copyPromise = imagesService.copyImages([100, 200], 1, 20);

      await expect(copyPromise).rejects.toThrow('Database error');

      expect(removeStoredImageFile).toHaveBeenCalledTimes(2);

      expect(removeStoredImageFile).toHaveBeenNthCalledWith(
        1,
        '/uploads/images/copied-1.jpg',
      );

      expect(removeStoredImageFile).toHaveBeenNthCalledWith(
        2,
        '/uploads/images/copied-2.jpg',
      );
    });
  });

  describe('deleteImages', () => {
    let transactionImagesRepositoryMock: {
      find: jest.Mock;
      remove: jest.Mock;
    };

    let managerMock: {
      getRepository: jest.Mock;
    };

    beforeEach(() => {
      transactionImagesRepositoryMock = {
        find: jest.fn(),
        remove: jest.fn(),
      };

      managerMock = {
        getRepository: jest.fn((entity: unknown) => {
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
    });

    it('removes images from database and deletes stored files', async () => {
      const images = [
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
        {
          id: 200,
          galleryId: 10,
          path: '/uploads/images/nature-2.jpg',
        },
      ];

      transactionImagesRepositoryMock.find.mockResolvedValue(images);

      transactionImagesRepositoryMock.remove.mockResolvedValue(images);

      await imagesService.deleteImages([100, 200], 1);

      expect(transactionImagesRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          id: In([100, 200]),
        },
      });

      expect(transactionImagesRepositoryMock.remove).toHaveBeenCalledWith(
        images,
      );

      expect(removeStoredImageFile).toHaveBeenCalledTimes(2);

      expect(removeStoredImageFile).toHaveBeenNthCalledWith(
        1,
        '/uploads/images/nature-1.jpg',
      );

      expect(removeStoredImageFile).toHaveBeenNthCalledWith(
        2,
        '/uploads/images/nature-2.jpg',
      );
    });

    it('throws NotFoundException when one or more images do not exist', async () => {
      transactionImagesRepositoryMock.find.mockResolvedValue([
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
      ]);

      const deletePromise = imagesService.deleteImages([100, 200], 1);

      await expect(deletePromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(deletePromise).rejects.toThrow(
        'One or more images not found',
      );

      expect(transactionImagesRepositoryMock.remove).not.toHaveBeenCalled();

      expect(removeStoredImageFile).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when user cannot edit image gallery', async () => {
      transactionImagesRepositoryMock.find.mockResolvedValue([
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/nature-1.jpg',
        },
      ]);

      galleriesServiceMock.getEditableGalleryOrThrow.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to edit this gallery',
        ),
      );

      const deletePromise = imagesService.deleteImages([100], 1);

      await expect(deletePromise).rejects.toBeInstanceOf(ForbiddenException);

      expect(transactionImagesRepositoryMock.remove).not.toHaveBeenCalled();

      expect(removeStoredImageFile).not.toHaveBeenCalled();
    });
  });
});
