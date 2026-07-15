import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn } from 'class-validator';

import { GalleryRole } from '../enums/gallery-role.enum';

export class CreateGalleryAccessDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: [GalleryRole.EDITOR, GalleryRole.VIEWER],
    example: GalleryRole.EDITOR,
  })
  @IsIn([GalleryRole.EDITOR, GalleryRole.VIEWER])
  role!: GalleryRole;
}
