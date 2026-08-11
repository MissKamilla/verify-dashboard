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
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';

import { GalleriesService } from '../galleries/galleries.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
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
