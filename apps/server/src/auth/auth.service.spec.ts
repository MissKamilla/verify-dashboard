import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { EmailVerification } from './entities/email-verification.entity';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  let usersServiceMock: {
    findByEmail: jest.Mock;
    createUser: jest.Mock;
    markEmailVerified: jest.Mock;
  };

  let jwtServiceMock: {
    signAsync: jest.Mock;
  };

  let mailServiceMock: {
    sendVerificationCode: jest.Mock;
  };

  let verificationRepositoryMock: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    jest.resetAllMocks();

    usersServiceMock = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      markEmailVerified: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    mailServiceMock = {
      sendVerificationCode: jest.fn(),
    };

    verificationRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    authService = new AuthService(
      usersServiceMock as unknown as UsersService,
      jwtServiceMock as unknown as JwtService,
      mailServiceMock as unknown as MailService,
      verificationRepositoryMock as unknown as Repository<EmailVerification>,
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

      expect(verificationRepositoryMock.save).not.toHaveBeenCalled();

      expect(mailServiceMock.sendVerificationCode).not.toHaveBeenCalled();

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('creates user, stores verification code and sends email when email is available', async () => {
      const dto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-code');

      const user = {
        id: 1,
        email: dto.email,
      };

      usersServiceMock.createUser.mockResolvedValue(user);

      verificationRepositoryMock.findOne.mockResolvedValue(null);

      const verification = {
        id: 1,
        user,
        codeHash: 'hashed-code',
        expiresAt: expect.any(Date),
      };

      verificationRepositoryMock.create.mockReturnValue(verification);

      const result = await authService.register(dto);

      expect(result).toEqual({
        message: 'Verification code sent',
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(usersServiceMock.createUser).toHaveBeenCalledWith({
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        password: 'hashed-password',
      });

      expect(verificationRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
      });

      expect(bcrypt.hash).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/^\d{6}$/),
        10,
      );

      expect(verificationRepositoryMock.create).toHaveBeenCalledWith({
        user,
        codeHash: 'hashed-code',
        expiresAt: expect.any(Date),
      });

      expect(verificationRepositoryMock.save).toHaveBeenCalledWith(
        verification,
      );

      expect(mailServiceMock.sendVerificationCode).toHaveBeenCalledWith(
        dto.email,
        expect.stringMatching(/^\d{6}$/),
      );

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('updates existing verification code when registering resend flow reuses createVerification', async () => {
      const dto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password1',
      };

      const user = {
        id: 1,
        email: dto.email,
      };

      const verification = {
        id: 1,
        user,
        codeHash: 'old-hash',
        expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      usersServiceMock.findByEmail.mockResolvedValue(null);

      usersServiceMock.createUser.mockResolvedValue(user);

      verificationRepositoryMock.findOne.mockResolvedValue(verification);

      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('new-code-hash');

      await authService.register(dto);

      expect(verificationRepositoryMock.create).not.toHaveBeenCalled();

      expect(verificationRepositoryMock.save).toHaveBeenCalledWith({
        ...verification,
        codeHash: 'new-code-hash',
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('verifyEmail', () => {
    it('throws BadRequestException when user does not exist', async () => {
      const dto: VerifyEmailDto = {
        email: 'john@example.com',
        code: '123456',
      };

      usersServiceMock.findByEmail.mockResolvedValue(null);

      const verifyPromise = authService.verifyEmail(dto);

      await expect(verifyPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(verifyPromise).rejects.toThrow('Invalid verification code');

      expect(verificationRepositoryMock.findOne).not.toHaveBeenCalled();

      expect(usersServiceMock.markEmailVerified).not.toHaveBeenCalled();

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when verification does not exist', async () => {
      const dto: VerifyEmailDto = {
        email: 'john@example.com',
        code: '123456',
      };

      const user = {
        id: 1,
        email: dto.email,
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);

      verificationRepositoryMock.findOne.mockResolvedValue(null);

      const verifyPromise = authService.verifyEmail(dto);

      await expect(verifyPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(verifyPromise).rejects.toThrow('Invalid verification code');

      expect(verificationRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();

      expect(usersServiceMock.markEmailVerified).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when verification is expired', async () => {
      const dto: VerifyEmailDto = {
        email: 'john@example.com',
        code: '123456',
      };

      const user = {
        id: 1,
        email: dto.email,
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);

      verificationRepositoryMock.findOne.mockResolvedValue({
        id: 1,
        codeHash: 'hashed-code',
        expiresAt: new Date(Date.now() - 1000),
        user,
      });

      const verifyPromise = authService.verifyEmail(dto);

      await expect(verifyPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(verifyPromise).rejects.toThrow('Verification code expired');

      expect(bcrypt.compare).not.toHaveBeenCalled();

      expect(usersServiceMock.markEmailVerified).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when code is invalid', async () => {
      const dto: VerifyEmailDto = {
        email: 'john@example.com',
        code: '123456',
      };

      const user = {
        id: 1,
        email: dto.email,
      };

      const verification = {
        id: 1,
        codeHash: 'hashed-code',
        expiresAt: new Date(Date.now() + 60_000),
        user,
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);

      verificationRepositoryMock.findOne.mockResolvedValue(verification);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const verifyPromise = authService.verifyEmail(dto);

      await expect(verifyPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(verifyPromise).rejects.toThrow('Invalid verification code');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.code,
        verification.codeHash,
      );

      expect(usersServiceMock.markEmailVerified).not.toHaveBeenCalled();
    });

    it('marks email verified, removes verification and returns token when code is valid', async () => {
      const dto: VerifyEmailDto = {
        email: 'john@example.com',
        code: '123456',
      };

      const user = {
        id: 1,
        email: dto.email,
      };

      const verification = {
        id: 1,
        codeHash: 'hashed-code',
        expiresAt: new Date(Date.now() + 60_000),
        user,
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);

      verificationRepositoryMock.findOne.mockResolvedValue(verification);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtServiceMock.signAsync.mockResolvedValue('test-token');

      const result = await authService.verifyEmail(dto);

      expect(result).toEqual({
        token: 'test-token',
      });

      expect(usersServiceMock.markEmailVerified).toHaveBeenCalledWith(user);

      expect(verificationRepositoryMock.remove).toHaveBeenCalledWith(
        verification,
      );

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });

  describe('resendVerification', () => {
    it('throws BadRequestException when user does not exist', async () => {
      const dto: ResendVerificationDto = {
        email: 'john@example.com',
      };

      usersServiceMock.findByEmail.mockResolvedValue(null);

      const resendPromise = authService.resendVerification(dto);

      await expect(resendPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(resendPromise).rejects.toThrow('User not found');

      expect(verificationRepositoryMock.save).not.toHaveBeenCalled();

      expect(mailServiceMock.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when email is already verified', async () => {
      const dto: ResendVerificationDto = {
        email: 'john@example.com',
      };

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      const resendPromise = authService.resendVerification(dto);

      await expect(resendPromise).rejects.toBeInstanceOf(BadRequestException);

      await expect(resendPromise).rejects.toThrow('Email is already verified');

      expect(verificationRepositoryMock.save).not.toHaveBeenCalled();

      expect(mailServiceMock.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('stores new verification code and sends email', async () => {
      const dto: ResendVerificationDto = {
        email: 'john@example.com',
      };

      const user = {
        id: 1,
        email: dto.email,
        verifiedAt: null,
      };

      const verification = {
        id: 1,
        user,
        codeHash: 'hashed-code',
        expiresAt: expect.any(Date),
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);

      verificationRepositoryMock.findOne.mockResolvedValue(null);

      verificationRepositoryMock.create.mockReturnValue(verification);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-code');

      const result = await authService.resendVerification(dto);

      expect(result).toEqual({
        message: 'Verification code sent',
      });

      expect(verificationRepositoryMock.save).toHaveBeenCalledWith(
        verification,
      );

      expect(mailServiceMock.sendVerificationCode).toHaveBeenCalledWith(
        dto.email,
        expect.stringMatching(/^\d{6}$/),
      );
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
        verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
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

    it('throws ForbiddenException when email is not verified', async () => {
      const dto = {
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed-password',
        verifiedAt: null,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginPromise = authService.login(dto);

      await expect(loginPromise).rejects.toBeInstanceOf(ForbiddenException);

      await expect(loginPromise).rejects.toThrow('Email is not verified');

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
        verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
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
