import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ImageMetafieldsDto {
  @ApiPropertyOptional({ example: 'Summer photo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Photo from vacation' })
  @IsOptional()
  @IsString()
  comment?: string;
}
