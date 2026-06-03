import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  jest.resetAllMocks();

  let authService: AuthService;

  let usersServiceMock: {
    findByEmail: jest.Mock;
    createUser: jest.Mock;
  };

  let jwtServiceMock: {
    signAsync: jest.Mock;
  };

  beforeEach(() => {
    usersServiceMock = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    authService = new AuthService(
      usersServiceMock as unknown as UsersService,
      jwtServiceMock as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('throws ConflictException when user with email already exists', async () => {
      const dto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      const registerPromise = authService.register(dto);

      await expect(registerPromise).rejects.toBeInstanceOf(ConflictException);

      await expect(registerPromise).rejects.toThrow(
        'User with this email already exists',
      );

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(usersServiceMock.createUser).not.toHaveBeenCalled();

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('creates user and returns token when email is available', async () => {
      const dto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      usersServiceMock.createUser.mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      jwtServiceMock.signAsync.mockResolvedValue('test-token');

      const result = await authService.register(dto);

      expect(result).toEqual({
        token: 'test-token',
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(usersServiceMock.createUser).toHaveBeenCalledWith({
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        password: 'hashed-password',
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: dto.email,
      });
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user does not exist', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue(null);

      const loginPromise = authService.login(dto);

      await expect(loginPromise).rejects.toBeInstanceOf(UnauthorizedException);

      await expect(loginPromise).rejects.toThrow('Invalid email or password');

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(dto.email, {
        withPassword: true,
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      const dto = {
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed-password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const loginPromise = authService.login(dto);

      await expect(loginPromise).rejects.toBeInstanceOf(UnauthorizedException);

      await expect(loginPromise).rejects.toThrow('Invalid email or password');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        'hashed-password',
      );

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('returns token when credentials are valid', async () => {
      const dto = {
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed-password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtServiceMock.signAsync.mockResolvedValue('test-token');

      const result = await authService.login(dto);

      expect(result).toEqual({
        token: 'test-token',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        'hashed-password',
      );

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: dto.email,
      });
    });
  });
});
