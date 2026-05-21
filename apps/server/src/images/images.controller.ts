import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  BadRequestException,
  Post,
  UploadedFiles,
  UseInterceptors,
  Delete,
  Patch,
  HttpCode,
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
import { UploadImagesDto } from './dto/upload-images.dto';
import { UpdateImageMetafieldsDto } from './dto/update-image-metafields.dto';
import { BulkImagesDto } from './dto/bulk-images.dto';
import { MoveImagesDto } from './dto/move-images.dto';
import { CopyImagesDto } from './dto/copy-images.dto';

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

  // Upload images

  @ApiOperation({ summary: 'Upload images to gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        [UPLOAD_IMAGES_FIELD_NAME]: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        metafields: {
          type: 'string',
          example: JSON.stringify([
            { name: 'Photo 1', comment: 'First photo comment' },
            { name: 'Photo 2', comment: 'Second photo comment' },
          ]),
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
    @Body() dto: UploadImagesDto,
  ) {
    if (!files?.length) {
      throw new BadRequestException('At least one image is required');
    }

    return this.imagesService.uploadToGallery(
      galleryId,
      userId,
      files,
      dto.metafields,
    );
  }

  // Update metafields

  @ApiOperation({ summary: 'Update image metafields' })
  @ApiOkResponse({
    description: 'Image metafields updated successfully',
    type: ImageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid metafields',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Image not found',
  })
  @Patch('images/:imageId/metafields')
  updateMetafields(
    @CurrentUser('sub') userId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() dto: UpdateImageMetafieldsDto,
  ) {
    return this.imagesService.updateMetafields(imageId, userId, dto);
  }

  // Move images

  @ApiOperation({ summary: 'Move images to another gallery' })
  @ApiOkResponse({
    description: 'Images moved successfully',
    type: [ImageResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid image ids or gallery limit exceeded',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'One or more images not found, or target gallery not found',
  })
  @Patch('images/move')
  moveImages(@CurrentUser('sub') userId: number, @Body() dto: MoveImagesDto) {
    return this.imagesService.moveImages(
      dto.imageIds,
      userId,
      dto.targetGalleryId,
    );
  }

  // Copy images

  @ApiOperation({ summary: 'Copy images to another gallery' })
  @ApiCreatedResponse({
    description: 'Images copied successfully',
    type: [ImageResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid image ids or gallery limit exceeded',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'One or more images not found, or target gallery not found',
  })
  @Post('images/copy')
  copyImages(@CurrentUser('sub') userId: number, @Body() dto: CopyImagesDto) {
    return this.imagesService.copyImages(
      dto.imageIds,
      userId,
      dto.targetGalleryId,
    );
  }

  // Delete images

  @ApiOperation({ summary: 'Delete images' })
  @ApiNoContentResponse({
    description: 'Images deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid image ids',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'One or more images not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('images')
  deleteImages(@CurrentUser('sub') userId: number, @Body() dto: BulkImagesDto) {
    return this.imagesService.deleteImages(dto.imageIds, userId);
  }
}
