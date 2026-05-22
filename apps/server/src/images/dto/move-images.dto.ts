import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

import { MAX_IMAGE_BULK_OPERATION_SIZE } from '../images.constants';

export class MoveImagesDto {
  @ApiProperty({ example: [1, 2, 3], maxItems: MAX_IMAGE_BULK_OPERATION_SIZE })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_IMAGE_BULK_OPERATION_SIZE)
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  imageIds!: number[];

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetGalleryId!: number;
}
