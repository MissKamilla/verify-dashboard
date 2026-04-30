import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Kate' })
  firstname!: string;

  @ApiProperty({ example: 'Smith' })
  lastname!: string;

  @ApiProperty({ example: 'kate@test.com' })
  email!: string;

  @ApiProperty({ example: '2026-04-29T12:00:00.000Z' })
  createdAt!: Date;
}
