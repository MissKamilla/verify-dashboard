import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ token: string }> {
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

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { token };
  }
}
