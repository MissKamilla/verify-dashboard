import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsBoolean } from 'class-validator';

import { GalleryRole, GALLERY_ACCESS_ROLES } from '../enums/gallery-role.enum';

import type { GalleryAccessRole } from '../enums/gallery-role.enum';

export class UpdateGalleryAccessDto {
  @ApiProperty({
    enum: [...GALLERY_ACCESS_ROLES],
    example: GalleryRole.VIEWER,
  })
  @IsIn([GalleryRole.EDITOR, GalleryRole.VIEWER])
  role!: GalleryAccessRole;
}

export class CreateGalleryAccessDto extends UpdateGalleryAccessDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  sendNotification!: boolean;
}

export class CheckGalleryAccessRecipientQueryDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;
}

export class CreateGalleryAccessResponseDto {
  @ApiProperty({
    enum: ['access_granted', 'invitation_sent'],
    example: 'access_granted',
  })
  status!: 'access_granted' | 'invitation_sent';
}
