import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  GALLERY_ACCESS_ROLES,
  type GalleryAccessRole,
} from '../../galleries/enums/gallery-role.enum';

export class InvitationResponseDto {
  @ApiProperty({ example: 'new-user@gmail.com' })
  email!: string;

  @ApiProperty({ example: 'Summer photos' })
  galleryTitle!: string;

  @ApiProperty({
    enum: [...GALLERY_ACCESS_ROLES],
  })
  role!: GalleryAccessRole;
}

export class RegisterByInviteDto {
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[^\d]*$/, {
    message: 'First name cannot contain numbers',
  })
  firstname!: string;

  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[^\d]*$/, {
    message: 'Last name cannot contain numbers',
  })
  lastname!: string;

  @ApiProperty({ minLength: 8 })
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
  password!: string;

  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  token!: string;
}
