import { ApiProperty } from '@nestjs/swagger';

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
