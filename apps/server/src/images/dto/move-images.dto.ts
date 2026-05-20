import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { BulkImagesDto } from './bulk-images.dto';

export class MoveImagesDto extends BulkImagesDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetGalleryId!: number;
}
