import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { UpdateImageMetafieldsDto } from './update-image-metafields.dto';
import { BadRequestException } from '@nestjs/common';

export class UploadImagesDto {
  @ApiPropertyOptional({
    description:
      'JSON string with image metafields. Order must match uploaded files order.',
    example: JSON.stringify([
      { name: 'Photo 1', comment: 'First photo comment' },
      { name: 'Photo 2', comment: 'Second photo comment' },
    ]),
  })
  @Transform(({ value }: { value: unknown }) => parseMetafields(value))
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateImageMetafieldsDto)
  metafields?: UpdateImageMetafieldsDto[];
}

function parseMetafields(value: unknown): unknown {
  if (!value) {
    return undefined;
  }

  const parsedValue = typeof value === 'string' ? parseJson(value) : value;

  if (!Array.isArray(parsedValue)) {
    return parsedValue;
  }

  return parsedValue.map((metafield) =>
    plainToInstance(UpdateImageMetafieldsDto, metafield),
  );
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new BadRequestException('Metafields must be a valid JSON string');
  }
}
