import { GalleriesController } from './galleries.controller';
import type { GalleriesService } from './galleries.service';
import type { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';

describe('GalleriesController', () => {
  let galleriesController: GalleriesController;

  let galleriesServiceMock: {
    createGallery: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    updateGallery: jest.Mock;
    removeGallery: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    galleriesServiceMock = {
      createGallery: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateGallery: jest.fn(),
      removeGallery: jest.fn(),
    };

    galleriesController = new GalleriesController(
      galleriesServiceMock as unknown as GalleriesService,
    );
  });

  describe('create', () => {
    it('creates gallery through service', async () => {
      const dto = {
        title: 'Nature',
        description: 'Nature photos',
      };

      const gallery = {
        id: 10,
        userId: 1,
        ...dto,
      };

      galleriesServiceMock.createGallery.mockResolvedValue(gallery);

      const result = await galleriesController.create(1, dto);

      expect(galleriesServiceMock.createGallery).toHaveBeenCalledWith(1, dto);

      expect(result).toEqual(gallery);
    });
  });

  describe('findAll', () => {
    it('returns galleries list from service', async () => {
      const query: GetGalleriesQueryDto = {
        page: 2,
        limit: 5,
        search: 'nature',
        sortBy: 'title',
        sortOrder: 'ASC',
      };

      const galleriesList = {
        items: [
          {
            id: 10,
            userId: 1,
            title: 'Nature',
            description: 'Nature photos',
          },
        ],
        total: 1,
        page: 2,
        limit: 5,
      };

      galleriesServiceMock.findAll.mockResolvedValue(galleriesList);

      const result = await galleriesController.findAll(1, query);

      expect(galleriesServiceMock.findAll).toHaveBeenCalledWith(1, query);

      expect(result).toEqual(galleriesList);
    });
  });

  describe('findById', () => {
    it('returns gallery by id from service', async () => {
      const gallery = {
        id: 10,
        userId: 1,
        title: 'Nature',
        description: 'Nature photos',
      };

      galleriesServiceMock.findById.mockResolvedValue(gallery);

      const result = await galleriesController.findById(1, 10);

      expect(galleriesServiceMock.findById).toHaveBeenCalledWith(10, 1);

      expect(result).toEqual(gallery);
    });
  });

  describe('update', () => {
    it('updates gallery through service', async () => {
      const dto = {
        title: 'Updated nature',
      };

      const updatedGallery = {
        id: 10,
        userId: 1,
        title: 'Updated nature',
        description: 'Nature photos',
      };

      galleriesServiceMock.updateGallery.mockResolvedValue(updatedGallery);

      const result = await galleriesController.update(1, 10, dto);

      expect(galleriesServiceMock.updateGallery).toHaveBeenCalledWith(
        10,
        1,
        dto,
      );

      expect(result).toEqual(updatedGallery);
    });
  });

  describe('remove', () => {
    it('removes gallery through service', async () => {
      galleriesServiceMock.removeGallery.mockResolvedValue(undefined);

      const result = await galleriesController.remove(1, 10);

      expect(galleriesServiceMock.removeGallery).toHaveBeenCalledWith(10, 1);

      expect(result).toBeUndefined();
    });
  });
});
