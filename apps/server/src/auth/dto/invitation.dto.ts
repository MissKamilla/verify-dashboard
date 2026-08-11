import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  firstname!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastname!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}
