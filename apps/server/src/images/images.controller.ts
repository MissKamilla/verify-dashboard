import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetImagesQueryDto } from './dto/get-images-query.dto';
import { ImagesListResponseDto } from './dto/images-list-response.dto';
import { ImagesService } from './images.service';

@Auth()
@ApiTags('Images')
@Controller()
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @ApiOperation({ summary: 'Get images by gallery' })
  @ApiOkResponse({
    description: 'Paginated images list',
    type: ImagesListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery not found',
  })
  @Get('galleries/:galleryId/images')
  findByGallery(
    @CurrentUser('sub') userId: number,
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @Query() query: GetImagesQueryDto,
  ) {
    return this.imagesService.findByGallery(galleryId, userId, query);
  }
}
