import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { DataSource, Repository } from 'typeorm';

import { GalleriesService } from '../galleries/galleries.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { GalleryAccess } from '../galleries/entities/gallery-access.entity';
import { GalleryInvitation } from '../galleries/entities/gallery-invitation.entity';
import { GalleryRole } from '../galleries/enums/gallery-role.enum';
import { EmailVerification } from './entities/email-verification.entity';
import { AuthService } from './auth.service';
import { RegisterByInviteDto } from './dto/invitation.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

function getFirstMockCallArg<T>(mock: jest.Mock): T {
  const [arg] = mock.mock.calls[0] as [T];

  return arg;
}

describe('AuthService', () => {
  let authService: AuthService;

  let dataSourceMock: {
    transaction: jest.Mock;
  };

  let galleriesServiceMock: {
    getInvitation: jest.Mock;
  };

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

    dataSourceMock = {
      transaction: jest.fn(),
    };

    galleriesServiceMock = {
      getInvitation: jest.fn(),
    };

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
      dataSourceMock as unknown as DataSource,
      galleriesServiceMock as unknown as GalleriesService,
      usersServiceMock as unknown as UsersService,
      jwtServiceMock as unknown as JwtService,
      mailServiceMock as unknown as MailService,
      verificationRepositoryMock as unknown as Repository<EmailVerification>,
    );
  });

  describe('register', () => {
    it('throws ConflictException when user with email already exists and is verified', async () => {
      const dto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password1',
      };

      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
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

    it('sends new verification code when existing user is not verified', async () => {
      const dto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password1',
      };

      const existingUser = {
        id: 1,
        email: dto.email,
        verifiedAt: null,
      };

      const verification = {
        id: 1,
        user: existingUser,
        codeHash: 'old-code-hash',
        expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      usersServiceMock.findByEmail.mockResolvedValue(existingUser);
      verificationRepositoryMock.findOne.mockResolvedValue(verification);

      (bcrypt.hash as jest.Mock).mockResolvedValue('new-code-hash');

      const result = await authService.register(dto);

      expect(result).toEqual({
        message: 'Verification code sent',
      });

      expect(usersServiceMock.createUser).not.toHaveBeenCalled();

      expect(bcrypt.hash).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{6}$/),
        10,
      );

      expect(verification.codeHash).toBe('new-code-hash');
      expect(verification.expiresAt).toBeInstanceOf(Date);

      expect(verificationRepositoryMock.save).toHaveBeenCalledWith(
        verification,
      );

      expect(mailServiceMock.sendVerificationCode).toHaveBeenCalledWith(
        existingUser.email,
        expect.stringMatching(/^\d{6}$/),
      );

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
        expiresAt: new Date('2026-01-01T00:00:00.000Z'),
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

      const createPayload = getFirstMockCallArg<{
        user: typeof user;
        codeHash: string;
        expiresAt: Date;
      }>(verificationRepositoryMock.create);

      expect(createPayload).toMatchObject({
        user,
        codeHash: 'hashed-code',
      });

      expect(createPayload.expiresAt).toBeInstanceOf(Date);

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

      expect(verification.codeHash).toBe('new-code-hash');

      expect(verification.expiresAt).toBeInstanceOf(Date);

      expect(verificationRepositoryMock.save).toHaveBeenCalledWith(
        verification,
      );
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
        expiresAt: new Date('2026-01-01T00:00:00.000Z'),
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

  describe('getInvitation', () => {
    it('returns invitation details from galleries service', async () => {
      const invitation = {
        email: 'invitee@test.com',
        galleryTitle: 'Nature',
        role: GalleryRole.VIEWER,
      };

      galleriesServiceMock.getInvitation.mockResolvedValue(invitation);

      const result = await authService.getInvitation('invite-token');

      expect(galleriesServiceMock.getInvitation).toHaveBeenCalledWith(
        'invite-token',
      );

      expect(result).toEqual(invitation);
    });
  });

  describe('registerByInvite', () => {
    let usersRepositoryMock: {
      findOne: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
    };

    let accessRepositoryMock: {
      create: jest.Mock;
      save: jest.Mock;
    };

    let invitationRepositoryMock: {
      findOne: jest.Mock;
      find: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      usersRepositoryMock = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      accessRepositoryMock = {
        create: jest.fn(),
        save: jest.fn(),
      };

      invitationRepositoryMock = {
        findOne: jest.fn(),
        find: jest.fn(),
        remove: jest.fn(),
      };

      const managerMock = {
        getRepository: jest.fn((entity: unknown) => {
          if (entity === User) {
            return usersRepositoryMock;
          }

          if (entity === GalleryAccess) {
            return accessRepositoryMock;
          }

          if (entity === GalleryInvitation) {
            return invitationRepositoryMock;
          }

          throw new Error('Unexpected repository');
        }),
      };

      dataSourceMock.transaction.mockImplementation(
        async (callback: (manager: typeof managerMock) => Promise<unknown>) =>
          callback(managerMock),
      );
    });

    it('creates verified user, grants access, removes invitation and returns token', async () => {
      const dto: RegisterByInviteDto = {
        firstname: 'Bob',
        lastname: 'Brown',
        password: 'Password123',
        token: 'invite-token',
      };

      const tokenHash = createHash('sha256').update(dto.token).digest('hex');

      const invitation = {
        id: 10,
        galleryId: 20,
        email: 'bob@test.com',
        role: GalleryRole.EDITOR,
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
      };

      const createdUser = {
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: invitation.email,
        password: 'hashed-password',
        verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      const savedUser = {
        id: 30,
        ...createdUser,
        verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      const access = {
        galleryId: invitation.galleryId,
        userId: savedUser.id,
        role: invitation.role,
      };

      galleriesServiceMock.getInvitation.mockResolvedValue({
        email: invitation.email,
        galleryTitle: 'Nature',
        role: invitation.role,
      });

      invitationRepositoryMock.findOne.mockResolvedValue(invitation);
      invitationRepositoryMock.find.mockResolvedValue([invitation]);

      usersRepositoryMock.findOne.mockResolvedValue(null);

      usersRepositoryMock.create.mockReturnValue(createdUser);

      usersRepositoryMock.save.mockResolvedValue(savedUser);

      accessRepositoryMock.create.mockReturnValue(access);

      jwtServiceMock.signAsync.mockResolvedValue('invite-auth-token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await authService.registerByInvite(dto);

      expect(galleriesServiceMock.getInvitation).toHaveBeenCalledWith(
        dto.token,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(invitationRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { tokenHash },
      });

      expect(invitationRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          email: invitation.email,
        },
      });

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: invitation.email },
      });

      const createUserPayload = getFirstMockCallArg<{
        firstname: string;
        lastname: string;
        email: string;
        password: string;
        verifiedAt: Date;
      }>(usersRepositoryMock.create);

      expect(createUserPayload).toMatchObject({
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: invitation.email,
        password: 'hashed-password',
      });

      expect(createUserPayload.verifiedAt).toBeInstanceOf(Date);

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(createdUser);

      expect(accessRepositoryMock.create).toHaveBeenCalledWith(access);

      expect(accessRepositoryMock.save).toHaveBeenCalledWith(access);

      expect(invitationRepositoryMock.remove).toHaveBeenCalledWith([
        invitation,
      ]);

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: savedUser.id,
        email: savedUser.email,
      });

      expect(result).toEqual({
        token: 'invite-auth-token',
      });
    });

    it('grants access for all active pending invitations with the same email', async () => {
      const dto: RegisterByInviteDto = {
        firstname: 'Bob',
        lastname: 'Brown',
        password: 'Password123',
        token: 'invite-token',
      };

      const tokenHash = createHash('sha256').update(dto.token).digest('hex');

      const invitation = {
        id: 10,
        galleryId: 20,
        email: 'bob@test.com',
        role: GalleryRole.EDITOR,
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
      };

      const secondInvitation = {
        id: 11,
        galleryId: 21,
        email: invitation.email,
        role: GalleryRole.VIEWER,
        tokenHash: 'second-token-hash',
        expiresAt: new Date(Date.now() + 60_000),
      };

      const expiredInvitation = {
        id: 12,
        galleryId: 22,
        email: invitation.email,
        role: GalleryRole.VIEWER,
        tokenHash: 'expired-token-hash',
        expiresAt: new Date(Date.now() - 60_000),
      };

      const savedUser = {
        id: 30,
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: invitation.email,
        password: 'hashed-password',
        verifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      galleriesServiceMock.getInvitation.mockResolvedValue({
        email: invitation.email,
        galleryTitle: 'Nature',
        role: invitation.role,
      });

      invitationRepositoryMock.findOne.mockResolvedValue(invitation);
      invitationRepositoryMock.find.mockResolvedValue([
        invitation,
        secondInvitation,
        expiredInvitation,
      ]);

      usersRepositoryMock.findOne.mockResolvedValue(null);
      usersRepositoryMock.create.mockReturnValue(savedUser);
      usersRepositoryMock.save.mockResolvedValue(savedUser);

      accessRepositoryMock.create.mockImplementation(
        (payload: { galleryId: number; userId: number; role: GalleryRole }) =>
          payload,
      );

      jwtServiceMock.signAsync.mockResolvedValue('invite-auth-token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await authService.registerByInvite(dto);

      expect(accessRepositoryMock.create).toHaveBeenCalledTimes(2);

      expect(accessRepositoryMock.create).toHaveBeenNthCalledWith(1, {
        galleryId: invitation.galleryId,
        userId: savedUser.id,
        role: invitation.role,
      });

      expect(accessRepositoryMock.create).toHaveBeenNthCalledWith(2, {
        galleryId: secondInvitation.galleryId,
        userId: savedUser.id,
        role: secondInvitation.role,
      });

      expect(accessRepositoryMock.save).toHaveBeenCalledTimes(2);

      expect(invitationRepositoryMock.remove).toHaveBeenCalledWith([
        invitation,
        secondInvitation,
        expiredInvitation,
      ]);

      expect(result).toEqual({
        token: 'invite-auth-token',
      });
    });

    it('throws ConflictException when invitation email already has an account', async () => {
      const dto: RegisterByInviteDto = {
        firstname: 'Bob',
        lastname: 'Brown',
        password: 'Password123',
        token: 'invite-token',
      };

      const invitation = {
        id: 10,
        galleryId: 20,
        email: 'bob@test.com',
        role: GalleryRole.VIEWER,
        tokenHash: createHash('sha256').update(dto.token).digest('hex'),
        expiresAt: new Date(Date.now() + 60_000),
      };

      galleriesServiceMock.getInvitation.mockResolvedValue({
        email: invitation.email,
        galleryTitle: 'Nature',
        role: invitation.role,
      });

      invitationRepositoryMock.findOne.mockResolvedValue(invitation);

      usersRepositoryMock.findOne.mockResolvedValue({
        id: 30,
        email: invitation.email,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const registerPromise = authService.registerByInvite(dto);

      await expect(registerPromise).rejects.toBeInstanceOf(ConflictException);

      await expect(registerPromise).rejects.toThrow(
        'User with this email already exists',
      );

      expect(usersRepositoryMock.create).not.toHaveBeenCalled();

      expect(accessRepositoryMock.save).not.toHaveBeenCalled();

      expect(invitationRepositoryMock.remove).not.toHaveBeenCalled();

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
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
