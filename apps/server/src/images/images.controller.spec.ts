import { BadRequestException } from '@nestjs/common';

import { ImagesController } from './images.controller';
import type { ImagesService } from './images.service';
import type { GetImagesQueryDto } from './dto/get-images-query.dto';

jest.mock('./images-upload.config', () => ({
  getImagesUploadOptions: jest.fn(() => ({})),
}));

describe('ImagesController', () => {
  let imagesController: ImagesController;

  let imagesServiceMock: {
    findByGallery: jest.Mock;
    uploadToGallery: jest.Mock;
    updateMetafields: jest.Mock;
    moveImages: jest.Mock;
    copyImages: jest.Mock;
    deleteImages: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    imagesServiceMock = {
      findByGallery: jest.fn(),
      uploadToGallery: jest.fn(),
      updateMetafields: jest.fn(),
      moveImages: jest.fn(),
      copyImages: jest.fn(),
      deleteImages: jest.fn(),
    };

    imagesController = new ImagesController(
      imagesServiceMock as unknown as ImagesService,
    );
  });

  describe('findByGallery', () => {
    it('returns images list from service', async () => {
      const query: GetImagesQueryDto = {
        page: 2,
        limit: 5,
      };

      const imagesList = {
        items: [
          {
            id: 100,
            galleryId: 10,
            path: '/uploads/images/lake.jpg',
          },
        ],
        total: 1,
        page: 2,
        limit: 5,
      };

      imagesServiceMock.findByGallery.mockResolvedValue(imagesList);

      const result = await imagesController.findByGallery(1, 10, query);

      expect(imagesServiceMock.findByGallery).toHaveBeenCalledWith(
        10,
        1,
        query,
      );

      expect(result).toEqual(imagesList);
    });
  });

  describe('uploadToGallery', () => {
    it.each([
      ['missing', undefined],
      ['empty', []],
    ])(
      'throws BadRequestException when files list is %s',
      (_caseName, files) => {
        expect(() =>
          imagesController.uploadToGallery(
            1,
            10,
            files as unknown as Express.Multer.File[],
            {},
          ),
        ).toThrow(BadRequestException);

        expect(() =>
          imagesController.uploadToGallery(
            1,
            10,
            files as unknown as Express.Multer.File[],
            {},
          ),
        ).toThrow('At least one image is required');

        expect(imagesServiceMock.uploadToGallery).not.toHaveBeenCalled();
      },
    );

    it('uploads files through service', async () => {
      const files = [
        {
          filename: 'lake.jpg',
          originalname: 'summer-lake.jpg',
          path: '/tmp/lake.jpg',
        },
      ] as unknown as Express.Multer.File[];

      const dto = {
        metafields: [
          {
            name: 'Lake',
            comment: 'Summer photo',
          },
        ],
      };

      const uploadedImages = [
        {
          id: 100,
          galleryId: 10,
          path: '/uploads/images/lake.jpg',
        },
      ];

      imagesServiceMock.uploadToGallery.mockResolvedValue(uploadedImages);

      const result = await imagesController.uploadToGallery(1, 10, files, dto);

      expect(imagesServiceMock.uploadToGallery).toHaveBeenCalledWith(
        10,
        1,
        files,
        dto.metafields,
      );

      expect(result).toEqual(uploadedImages);
    });
  });

  describe('updateMetafields', () => {
    it('updates image metafields through service', async () => {
      const dto = {
        name: 'Updated lake',
        comment: 'Updated comment',
      };

      const updatedImage = {
        id: 100,
        metafields: dto,
      };

      imagesServiceMock.updateMetafields.mockResolvedValue(updatedImage);

      const result = await imagesController.updateMetafields(1, 100, dto);

      expect(imagesServiceMock.updateMetafields).toHaveBeenCalledWith(
        100,
        1,
        dto,
      );

      expect(result).toEqual(updatedImage);
    });
  });

  describe('moveImages', () => {
    it('moves images through service', async () => {
      const dto = {
        imageIds: [100, 200],
        targetGalleryId: 20,
      };

      const movedImages = [
        {
          id: 100,
          galleryId: 20,
        },
        {
          id: 200,
          galleryId: 20,
        },
      ];

      imagesServiceMock.moveImages.mockResolvedValue(movedImages);

      const result = await imagesController.moveImages(1, dto);

      expect(imagesServiceMock.moveImages).toHaveBeenCalledWith(
        [100, 200],
        1,
        20,
      );

      expect(result).toEqual(movedImages);
    });
  });

  describe('copyImages', () => {
    it('copies images through service', async () => {
      const dto = {
        imageIds: [100, 200],
        targetGalleryId: 20,
      };

      const copiedImages = [
        {
          id: 300,
          galleryId: 20,
        },
        {
          id: 400,
          galleryId: 20,
        },
      ];

      imagesServiceMock.copyImages.mockResolvedValue(copiedImages);

      const result = await imagesController.copyImages(1, dto);

      expect(imagesServiceMock.copyImages).toHaveBeenCalledWith(
        [100, 200],
        1,
        20,
      );

      expect(result).toEqual(copiedImages);
    });
  });

  describe('deleteImages', () => {
    it('deletes images through service', async () => {
      imagesServiceMock.deleteImages.mockResolvedValue(undefined);

      const result = await imagesController.deleteImages(1, {
        imageIds: [100, 200],
      });

      expect(imagesServiceMock.deleteImages).toHaveBeenCalledWith(
        [100, 200],
        1,
      );

      expect(result).toBeUndefined();
    });
  });
});
