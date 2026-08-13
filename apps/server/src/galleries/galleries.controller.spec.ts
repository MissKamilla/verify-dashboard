import { GalleriesController } from './galleries.controller';
import type { GalleriesService } from './galleries.service';
import type { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { GalleryRole } from './enums/gallery-role.enum';

describe('GalleriesController', () => {
  let galleriesController: GalleriesController;

  let galleriesServiceMock: {
    createGallery: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    updateGallery: jest.Mock;
    removeGallery: jest.Mock;
    createAccess: jest.Mock;
    findAllAccesses: jest.Mock;
    updateAccess: jest.Mock;
    removeAccess: jest.Mock;
    removePendingInvitation: jest.Mock;
    checkAccessRecipient: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    galleriesServiceMock = {
      createGallery: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateGallery: jest.fn(),
      removeGallery: jest.fn(),
      createAccess: jest.fn(),
      findAllAccesses: jest.fn(),
      updateAccess: jest.fn(),
      removeAccess: jest.fn(),
      removePendingInvitation: jest.fn(),
      checkAccessRecipient: jest.fn(),
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

  describe('createAccess', () => {
    it('creates gallery access or invitation through service', async () => {
      const dto = {
        email: 'invitee@test.com',
        role: GalleryRole.VIEWER,
        sendNotification: true,
      };

      const response = {
        status: 'invitation_sent',
      };

      galleriesServiceMock.createAccess.mockResolvedValue(response);

      const result = await galleriesController.createAccess(1, 10, dto);

      expect(galleriesServiceMock.createAccess).toHaveBeenCalledWith(
        10,
        1,
        dto,
      );

      expect(result).toEqual(response);
    });
  });

  describe('findAllAccesses', () => {
    it('returns gallery access list through service', async () => {
      const accesses = [
        {
          id: 100,
          galleryId: 10,
          email: 'pending@test.com',
          role: 'viewer',
          status: 'pending',
        },
      ];

      galleriesServiceMock.findAllAccesses.mockResolvedValue(accesses);

      const result = await galleriesController.findAllAccesses(1, 10);

      expect(galleriesServiceMock.findAllAccesses).toHaveBeenCalledWith(10, 1);

      expect(result).toEqual(accesses);
    });
  });

  describe('updateAccess', () => {
    it('updates gallery access through service', async () => {
      const dto = {
        role: GalleryRole.EDITOR,
      };

      const access = {
        galleryId: 10,
        userId: 2,
        role: GalleryRole.EDITOR,
      };

      galleriesServiceMock.updateAccess.mockResolvedValue(access);

      const result = await galleriesController.updateAccess(1, 10, 2, dto);

      expect(galleriesServiceMock.updateAccess).toHaveBeenCalledWith(
        10,
        2,
        1,
        dto,
      );

      expect(result).toEqual(access);
    });
  });

  describe('removeAccess', () => {
    it('removes gallery access through service', async () => {
      galleriesServiceMock.removeAccess.mockResolvedValue(undefined);

      const result = await galleriesController.removeAccess(1, 10, 2);

      expect(galleriesServiceMock.removeAccess).toHaveBeenCalledWith(10, 2, 1);

      expect(result).toBeUndefined();
    });
  });

  describe('removePendingInvitation', () => {
    it('removes pending gallery invitation through service', async () => {
      galleriesServiceMock.removePendingInvitation.mockResolvedValue(undefined);

      const result = await galleriesController.removePendingInvitation(
        1,
        10,
        30,
      );

      expect(galleriesServiceMock.removePendingInvitation).toHaveBeenCalledWith(
        10,
        30,
        1,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('checkAccessRecipient', () => {
    it('checks recipient registration status through service', async () => {
      const response = {
        registered: false,
      };

      galleriesServiceMock.checkAccessRecipient.mockResolvedValue(response);

      const result = await galleriesController.checkAccessRecipient(10, 1, {
        email: 'invitee@test.com',
      });

      expect(galleriesServiceMock.checkAccessRecipient).toHaveBeenCalledWith(
        10,
        1,
        'invitee@test.com',
      );

      expect(result).toEqual(response);
    });
  });
});
