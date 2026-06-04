import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;

  let usersRepositoryMock: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  let queryBuilderMock: {
    where: jest.Mock;
    addSelect: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(() => {
    jest.resetAllMocks();

    queryBuilderMock = {
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    usersRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    usersService = new UsersService(
      usersRepositoryMock as unknown as Repository<User>,
    );
  });

  describe('findById', () => {
    it('returns user profile when user exists', async () => {
      const createdAt = new Date('2026-06-03T10:00:00.000Z');

      usersRepositoryMock.findOne.mockResolvedValue({
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt,
      });

      const result = await usersService.findById(1);

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual({
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        createdAt,
      });

      expect(result).not.toHaveProperty('password');
    });

    it('throws NotFoundException when user does not exist', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      const findPromise = usersService.findById(999);

      await expect(findPromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(findPromise).rejects.toThrow('User not found');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
    });
  });

  describe('createUser', () => {
    it('creates and saves user', async () => {
      const data = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
      };

      const user = {
        id: 1,
        ...data,
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      usersRepositoryMock.create.mockReturnValue(user);

      usersRepositoryMock.save.mockResolvedValue(user);

      const result = await usersService.createUser(data);

      expect(usersRepositoryMock.create).toHaveBeenCalledWith(data);

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(user);

      expect(result).toEqual(user);
    });
  });

  describe('findByEmail', () => {
    it('returns user by email', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      queryBuilderMock.getOne.mockResolvedValue(user);

      const result = await usersService.findByEmail(user.email);

      expect(usersRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
        'user',
      );

      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'user.email = :email',
        {
          email: user.email,
        },
      );

      expect(queryBuilderMock.addSelect).not.toHaveBeenCalled();

      expect(queryBuilderMock.getOne).toHaveBeenCalled();

      expect(result).toEqual(user);

      expect(result).not.toHaveProperty('password');
    });

    it('adds password to select when withPassword option is enabled', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      queryBuilderMock.getOne.mockResolvedValue(user);

      const result = await usersService.findByEmail(user.email, {
        withPassword: true,
      });

      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('user.password');

      expect(queryBuilderMock.getOne).toHaveBeenCalled();

      expect(result).toEqual(user);
    });
  });

  describe('updateProfile', () => {
    it('throws NotFoundException when user does not exist', async () => {
      const dto = {
        firstname: 'Jane',
      };

      usersRepositoryMock.findOne.mockResolvedValue(null);

      const updatePromise = usersService.updateProfile(999, dto);

      await expect(updatePromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(updatePromise).rejects.toThrow('User not found');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });

      expect(usersRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('updates firstname and lastname', async () => {
      const createdAt = new Date('2026-06-03T10:00:00.000Z');

      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt,
      };

      const dto = {
        firstname: 'Jane',
        lastname: 'Smith',
      };

      usersRepositoryMock.findOne.mockResolvedValue(user);

      usersRepositoryMock.save.mockResolvedValue(user);

      const result = await usersService.updateProfile(1, dto);

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(usersRepositoryMock.save).toHaveBeenCalledWith({
        ...user,
        firstname: 'Jane',
        lastname: 'Smith',
      });

      expect(usersRepositoryMock.createQueryBuilder).not.toHaveBeenCalled();

      expect(result).toEqual({
        id: 1,
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'john@example.com',
        createdAt,
      });
    });

    it('throws ConflictException when new email is already used', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        email: 'jane@example.com',
      };

      usersRepositoryMock.findOne.mockResolvedValue(user);

      queryBuilderMock.getOne.mockResolvedValue({
        id: 2,
        email: dto.email,
      });

      const updatePromise = usersService.updateProfile(1, dto);

      await expect(updatePromise).rejects.toBeInstanceOf(ConflictException);

      await expect(updatePromise).rejects.toThrow(
        'User with this email already exists',
      );

      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'user.email = :email',
        {
          email: dto.email,
        },
      );

      expect(usersRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('updates email when new email is available', async () => {
      const createdAt = new Date('2026-06-03T10:00:00.000Z');

      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt,
      };

      const dto = {
        email: 'jane@example.com',
      };

      usersRepositoryMock.findOne.mockResolvedValue(user);

      queryBuilderMock.getOne.mockResolvedValue(null);

      usersRepositoryMock.save.mockResolvedValue(user);

      const result = await usersService.updateProfile(1, dto);

      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'user.email = :email',
        {
          email: dto.email,
        },
      );

      expect(usersRepositoryMock.save).toHaveBeenCalledWith({
        ...user,
        email: dto.email,
      });

      expect(result).toEqual({
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'jane@example.com',
        createdAt,
      });
    });

    it('throws BadRequestException when old password is missing', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        password: 'NewPassword1',
      };

      usersRepositoryMock.findOne.mockResolvedValue(user);

      const updatePromise = usersService.updateProfile(1, dto);

      await expect(updatePromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(updatePromise).rejects.toThrow('Old password is required');

      expect(usersRepositoryMock.createQueryBuilder).not.toHaveBeenCalled();

      expect(usersRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when old password is incorrect', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        oldPassword: 'WrongPassword1',
        password: 'NewPassword1',
      };

      usersRepositoryMock.findOne.mockResolvedValue(user);

      queryBuilderMock.getOne.mockResolvedValue({
        id: 1,
        password: 'hashed-password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const updatePromise = usersService.updateProfile(1, dto);

      await expect(updatePromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(updatePromise).rejects.toThrow('Old password is incorrect');

      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('user.password');

      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :id', {
        id: 1,
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.oldPassword,
        'hashed-password',
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();

      expect(usersRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('updates password when old password is correct', async () => {
      const createdAt = new Date('2026-06-03T10:00:00.000Z');

      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'old-hashed-password',
        createdAt,
      };

      const dto = {
        oldPassword: 'OldPassword1',
        password: 'NewPassword1',
      };

      usersRepositoryMock.findOne.mockResolvedValue(user);

      queryBuilderMock.getOne.mockResolvedValue({
        id: 1,
        password: 'old-hashed-password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      usersRepositoryMock.save.mockResolvedValue(user);

      const result = await usersService.updateProfile(1, dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.oldPassword,
        'old-hashed-password',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(user.password).toBe('new-hashed-password');

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(user);

      expect(result).toEqual({
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        createdAt,
      });

      expect(result).not.toHaveProperty('password');
    });

    it('throws NotFoundException when user with password does not exist', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'old-hashed-password',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
      };

      const dto = {
        oldPassword: 'OldPassword1',
        password: 'NewPassword1',
      };

      usersRepositoryMock.findOne.mockResolvedValue(user);

      queryBuilderMock.getOne.mockResolvedValue(null);

      const updatePromise = usersService.updateProfile(1, dto);

      await expect(updatePromise).rejects.toBeInstanceOf(NotFoundException);

      await expect(updatePromise).rejects.toThrow('User not found');

      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('user.password');

      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :id', {
        id: 1,
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();

      expect(bcrypt.hash).not.toHaveBeenCalled();

      expect(usersRepositoryMock.save).not.toHaveBeenCalled();
    });
  });
});
