import { ApiProperty } from '@nestjs/swagger';

export class GalleryPreviewImageResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '/uploads/images/photo-123.png' })
  path!: string;
}
