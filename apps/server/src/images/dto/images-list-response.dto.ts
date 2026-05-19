import { ApiProperty } from '@nestjs/swagger';

import { ImageResponseDto } from './image-response.dto';

export class ImagesListResponseDto {
  @ApiProperty({ type: [ImageResponseDto] })
  items!: ImageResponseDto[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
