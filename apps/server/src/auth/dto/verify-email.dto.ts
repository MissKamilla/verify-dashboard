import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'anna@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '482913' })
  @Matches(/^\d{6}$/, {
    message: 'Code must contain 6 digits',
  })
  code!: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'anna@test.com' })
  @IsEmail()
  email!: string;
}
