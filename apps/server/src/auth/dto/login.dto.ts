import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'anna@test.com' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
