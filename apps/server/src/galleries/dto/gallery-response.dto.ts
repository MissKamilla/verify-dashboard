import { ApiProperty } from '@nestjs/swagger';

export class GalleryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Nature' })
  title!: string;

  @ApiProperty({ example: 'Photos from nature trips' })
  description!: string;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  createdAt!: Date;
}
