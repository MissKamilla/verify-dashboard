import { ApiProperty } from '@nestjs/swagger';

import { GalleryResponseDto } from './gallery-response.dto';

export class GalleriesListResponseDto {
  @ApiProperty({ type: [GalleryResponseDto] })
  items!: GalleryResponseDto[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
