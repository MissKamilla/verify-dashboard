import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Anna' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[^\d]*$/, {
    message: 'First name cannot contain numbers',
  })
  firstname?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[^\d]*$/, {
    message: 'First name cannot contain numbers',
  })
  lastname?: string;

  @ApiPropertyOptional({ example: 'anna@test.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'newPassword123' })
  @IsOptional()
  @IsString()
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/\d/, {
    message: 'Password must contain at least one number',
  })
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @ApiPropertyOptional({ example: 'oldPassword123' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  oldPassword?: string;
}
