import { ApiPropertyOptional } from '@nestjs/swagger';

export class ImageMetafieldsDto {
  @ApiPropertyOptional({ example: 'Summer photo' })
  name?: string;

  @ApiPropertyOptional({ example: 'Photo from vacation' })
  comment?: string;
}
