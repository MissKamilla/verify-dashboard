import { ApiProperty } from '@nestjs/swagger';

import { GalleryListItemResponseDto } from './gallery-list-item-response.dto';

export class GalleriesListResponseDto {
  @ApiProperty({ type: [GalleryListItemResponseDto] })
  items!: GalleryListItemResponseDto[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
