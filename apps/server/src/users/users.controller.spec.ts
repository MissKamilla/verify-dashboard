import { UsersController } from './users.controller';
import type { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;

  let usersServiceMock: {
    findById: jest.Mock;
    updateProfile: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    usersServiceMock = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
    };

    usersController = new UsersController(
      usersServiceMock as unknown as UsersService,
    );
  });

  describe('getProfile', () => {
    it('returns current user profile from service', async () => {
      const profile = {
        id: 1,
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
      };

      usersServiceMock.findById.mockResolvedValue(profile);

      const result = await usersController.getProfile(1);

      expect(usersServiceMock.findById).toHaveBeenCalledWith(1);

      expect(result).toEqual(profile);
    });
  });

  describe('updateProfile', () => {
    it('updates current user profile through service', async () => {
      const dto = {
        firstname: 'Kate',
        email: 'kate@test.com',
      };

      const updatedProfile = {
        id: 1,
        firstname: 'Kate',
        lastname: 'Smith',
        email: 'kate@test.com',
      };

      usersServiceMock.updateProfile.mockResolvedValue(updatedProfile);

      const result = await usersController.updateProfile(1, dto);

      expect(usersServiceMock.updateProfile).toHaveBeenCalledWith(1, dto);

      expect(result).toEqual(updatedProfile);
    });
  });
});
