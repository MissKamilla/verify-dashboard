import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ImageMetafieldsDto {
  @ApiPropertyOptional({ example: 'Summer photo' })
  name?: string;

  @ApiPropertyOptional({ example: 'Photo from vacation' })
  comment?: string;
}

export class ImageResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '/uploads/images/photo-123.png' })
  path!: string;

  @ApiProperty({ example: 1 })
  galleryId!: number;

  @ApiProperty({ example: 'photo.png' })
  originalFilename!: string;

  @ApiProperty({
    type: ImageMetafieldsDto,
    example: {
      name: 'Summer photo',
      comment: 'Photo from vacation',
    },
  })
  metafields!: ImageMetafieldsDto;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  createdAt!: Date;
}
