import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Get,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  InvitationResponseDto,
  RegisterByInviteDto,
} from './dto/invitation.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { ResendVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'Verification code sent',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Verify user email' })
  @ApiOkResponse({
    description: 'Email verified successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification code',
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<AuthResponseDto> {
    return this.authService.verifyEmail(dto);
  }

  @ApiOperation({ summary: 'Resend verification code' })
  @ApiOkResponse({
    description: 'Verification code sent',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User not found or email already verified',
  })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.resendVerification(dto);
  }

  @ApiOperation({ summary: 'Get gallery invitation details' })
  @ApiOkResponse({
    description: 'Invitation details',
    type: InvitationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired invitation',
  })
  @Get('invitations/:token')
  getInvitation(@Param('token') token: string): Promise<InvitationResponseDto> {
    return this.authService.getInvitation(token);
  }

  @ApiOperation({ summary: 'Register user by gallery invitation' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired invitation',
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @Post('register-by-invite')
  registerByInvite(@Body() dto: RegisterByInviteDto): Promise<AuthResponseDto> {
    return this.authService.registerByInvite(dto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }
}
