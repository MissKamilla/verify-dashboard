import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

import { MAX_IMAGE_BULK_OPERATION_SIZE } from '../images.constants';

export class DeleteImagesQueryDto {
  @ApiProperty({
    type: Number,
    isArray: true,
    maxItems: MAX_IMAGE_BULK_OPERATION_SIZE,
    example: [1, 2],
    description:
      'Image ids to delete. Use repeated query params: ?imageIds=1&imageIds=2.',
  })
  @Transform(({ value }: { value: string | string[] }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_IMAGE_BULK_OPERATION_SIZE)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  imageIds!: number[];
}
