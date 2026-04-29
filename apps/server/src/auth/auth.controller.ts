import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<{ token: string }> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<{ token: string }> {
    return this.authService.login(dto);
  }
}
