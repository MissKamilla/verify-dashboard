import { ApiProperty } from '@nestjs/swagger';

import { GalleryResponseDto } from './gallery-response.dto';
import { GalleryPreviewImageResponseDto } from './gallery-preview-image-response.dto';

export class GalleryListItemResponseDto extends GalleryResponseDto {
  @ApiProperty({ example: 16 })
  photosCount!: number;

  @ApiProperty({ type: [GalleryPreviewImageResponseDto] })
  previewImages!: GalleryPreviewImageResponseDto[];
}
