import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class DeleteImagesQueryDto {
  @ApiProperty({
    type: Number,
    isArray: true,
    example: [1, 2],
    description: 'Image ids to delete',
  })
  @Transform(({ value }: { value: string | string[] }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  imageIds!: number[];
}
