import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  BadRequestException,
  Post,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
import { ImageResponseDto } from './dto/image-response.dto';
import {
  MAX_IMAGES_PER_GALLERY,
  UPLOAD_IMAGES_FIELD_NAME,
} from './images.constants';
import { ImagesService } from './images.service';
import { getImagesUploadOptions } from './images-upload.config';

@Auth()
@ApiTags('Images')
@Controller()
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // Gallery images

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

  // Image upload

  @ApiOperation({ summary: 'Upload images to gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Images uploaded successfully',
    type: [ImageResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid files',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery not found',
  })
  @Post('galleries/:galleryId/images')
  @UseInterceptors(
    FilesInterceptor(
      UPLOAD_IMAGES_FIELD_NAME,
      MAX_IMAGES_PER_GALLERY,
      getImagesUploadOptions(),
    ),
  )
  uploadToGallery(
    @CurrentUser('sub') userId: number,
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files.length) {
      throw new BadRequestException('At least one image is required');
    }

    return this.imagesService.uploadToGallery(galleryId, userId, files);
  }

  // Image delete

  @ApiOperation({ summary: 'Delete image' })
  @ApiNoContentResponse({
    description: 'Image deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Image not found',
  })
  @Delete('images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(
    @CurrentUser('sub') userId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.imagesService.deleteImage(imageId, userId);
  }
}
