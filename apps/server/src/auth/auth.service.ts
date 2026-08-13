import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { DataSource, Repository } from 'typeorm';

import { GalleriesService } from '../galleries/galleries.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { GalleryAccess } from '../galleries/entities/gallery-access.entity';
import { GalleryInvitation } from '../galleries/entities/gallery-invitation.entity';
import { RegisterByInviteDto } from './dto/invitation.dto';
import { EmailVerification } from './entities/email-verification.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly galleriesService: GalleriesService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,

    @InjectRepository(EmailVerification)
    private readonly verificationRepository: Repository<EmailVerification>,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      if (!existingUser.verifiedAt) {
        const code = await this.createVerification(existingUser);

        await this.mailService.sendVerificationCode(existingUser.email, code);

        return {
          message: 'Verification code sent',
        };
      }

      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      password: hashedPassword,
    });

    const code = await this.createVerification(user);

    await this.mailService.sendVerificationCode(user.email, code);

    return {
      message: 'Verification code sent',
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ token: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    const verification = await this.verificationRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification code');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    const isCodeValid = await bcrypt.compare(dto.code, verification.codeHash);

    if (!isCodeValid) {
      throw new BadRequestException('Invalid verification code');
    }
    await this.usersService.markEmailVerified(user);

    await this.verificationRepository.remove(verification);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { token };
  }

  async resendVerification(
    dto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verifiedAt) {
      throw new BadRequestException('Email is already verified');
    }

    const code = await this.createVerification(user);

    await this.mailService.sendVerificationCode(user.email, code);

    return {
      message: 'Verification code sent',
    };
  }

  getInvitation(token: string) {
    return this.galleriesService.getInvitation(token);
  }

  async registerByInvite(dto: RegisterByInviteDto): Promise<{ token: string }> {
    await this.galleriesService.getInvitation(dto.token);

    const password = await bcrypt.hash(dto.password, 10);

    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const user = await this.dataSource.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const accessRepository = manager.getRepository(GalleryAccess);
      const invitationRepository = manager.getRepository(GalleryInvitation);

      const now = new Date();

      const invitation = await invitationRepository.findOne({
        where: { tokenHash },
      });

      if (!invitation) {
        throw new BadRequestException('Invalid invitation');
      }

      if (invitation.expiresAt < now) {
        throw new BadRequestException('Invitation expired');
      }

      const existingUser = await usersRepository.findOne({
        where: { email: invitation.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const newUser = usersRepository.create({
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: invitation.email,
        password,
        verifiedAt: new Date(),
      });

      const savedUser = await usersRepository.save(newUser);

      const invitations = await invitationRepository.find({
        where: {
          email: invitation.email,
        },
      });

      const invitationsToApply = invitations.some(
        (pendingInvitation) => pendingInvitation.id === invitation.id,
      )
        ? invitations
        : [invitation, ...invitations];

      const activeInvitations = invitationsToApply.filter(
        (pendingInvitation) => pendingInvitation.expiresAt >= now,
      );

      for (const pendingInvitation of activeInvitations) {
        const access = accessRepository.create({
          galleryId: pendingInvitation.galleryId,
          userId: savedUser.id,
          role: pendingInvitation.role,
        });

        await accessRepository.save(access);
      }

      await invitationRepository.remove(invitationsToApply);

      return savedUser;
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { token };
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.usersService.findByEmail(dto.email, {
      withPassword: true,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.verifiedAt) {
      throw new ForbiddenException('Email is not verified');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { token };
  }

  private async createVerification(user: User): Promise<string> {
    const code = randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    let verification = await this.verificationRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (verification) {
      verification.codeHash = codeHash;
      verification.expiresAt = expiresAt;
    } else {
      verification = this.verificationRepository.create({
        user,
        codeHash,
        expiresAt,
      });
    }

    await this.verificationRepository.save(verification);

    return code;
  }
}
