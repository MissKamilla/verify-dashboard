import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { GalleryRole } from '../enums/gallery-role.enum';

export class UpdateGalleryAccessDto {
  @ApiProperty({
    enum: [GalleryRole.EDITOR, GalleryRole.VIEWER],
    example: GalleryRole.VIEWER,
  })
  @IsIn([GalleryRole.EDITOR, GalleryRole.VIEWER])
  role!: GalleryRole;
}
