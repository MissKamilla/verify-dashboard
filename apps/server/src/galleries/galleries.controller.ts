import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GalleriesService } from './galleries.service';
import { GalleryResponseDto } from './dto/gallery-response.dto';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import {
  CreateGalleryAccessDto,
  UpdateGalleryAccessDto,
} from './dto/gallery-access.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { GalleriesListResponseDto } from './dto/galleries-list-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Auth()
@ApiTags('Galleries')
@Controller('galleries')
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @ApiOperation({ summary: 'Create gallery' })
  @ApiCreatedResponse({
    description: 'Gallery created',
    type: GalleryResponseDto,
  })
  @ApiConflictResponse({
    description: 'Gallery with this title already exists',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @Post()
  create(@CurrentUser('sub') userId: number, @Body() dto: CreateGalleryDto) {
    return this.galleriesService.createGallery(userId, dto);
  }

  @ApiOperation({ summary: 'Get galleries list' })
  @ApiOkResponse({
    description: 'Paginated galleries list',
    type: GalleriesListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @Get()
  findAll(
    @CurrentUser('sub') userId: number,
    @Query() query: GetGalleriesQueryDto,
  ) {
    return this.galleriesService.findAll(userId, query);
  }

  @ApiOperation({ summary: 'Get gallery by id' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Gallery id',
  })
  @ApiOkResponse({
    description: 'Gallery details',
    type: GalleryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery not found',
  })
  @Get(':id')
  findById(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.galleriesService.findById(id, userId);
  }

  @ApiOperation({ summary: 'Update gallery' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Gallery id',
  })
  @ApiOkResponse({
    description: 'Gallery updated',
    type: GalleryResponseDto,
  })
  @ApiConflictResponse({
    description: 'Gallery with this title already exists',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery not found',
  })
  @Patch(':id')
  update(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryDto,
  ) {
    return this.galleriesService.updateGallery(id, userId, dto);
  }

  @ApiOperation({ summary: 'Delete gallery' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Gallery id',
  })
  @ApiNoContentResponse({
    description: 'Gallery deleted',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.galleriesService.removeGallery(id, userId);
  }

  @ApiOperation({ summary: 'Grant gallery access' })
  @ApiParam({
    name: 'galleryId',
    type: Number,
    example: 1,
    description: 'Gallery id',
  })
  @ApiCreatedResponse({
    description: 'Gallery access granted',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or attempt to share with yourself',
  })
  @ApiConflictResponse({
    description: 'User already has access to this gallery',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery or user not found',
  })
  @Post(':galleryId/access')
  createAccess(
    @CurrentUser('sub') currentUserId: number,
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @Body() dto: CreateGalleryAccessDto,
  ) {
    return this.galleriesService.createAccess(galleryId, currentUserId, dto);
  }

  @ApiOperation({ summary: 'Get gallery access list' })
  @ApiParam({
    name: 'galleryId',
    type: Number,
    example: 1,
    description: 'Gallery id',
  })
  @ApiOkResponse({
    description: 'Gallery access list',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery not found',
  })
  @Get(':galleryId/access')
  findAllAccesses(
    @CurrentUser('sub') currentUserId: number,
    @Param('galleryId', ParseIntPipe) galleryId: number,
  ) {
    return this.galleriesService.findAllAccesses(galleryId, currentUserId);
  }

  @ApiOperation({ summary: 'Update gallery access role' })
  @ApiParam({
    name: 'galleryId',
    type: Number,
    example: 1,
    description: 'Gallery id',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    example: 2,
    description: 'User id',
  })
  @ApiOkResponse({
    description: 'Gallery access role updated',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery or gallery access not found',
  })
  @Patch(':galleryId/access/:userId')
  updateAccess(
    @CurrentUser('sub') currentUserId: number,
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Body() dto: UpdateGalleryAccessDto,
  ) {
    return this.galleriesService.updateAccess(
      galleryId,
      targetUserId,
      currentUserId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Revoke gallery access' })
  @ApiParam({
    name: 'galleryId',
    type: Number,
    example: 1,
    description: 'Gallery id',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    example: 2,
    description: 'User id',
  })
  @ApiNoContentResponse({
    description: 'Gallery access revoked',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  @ApiNotFoundResponse({
    description: 'Gallery or gallery access not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':galleryId/access/:userId')
  removeAccess(
    @CurrentUser('sub') currentUserId: number,
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ) {
    return this.galleriesService.removeAccess(
      galleryId,
      targetUserId,
      currentUserId,
    );
  }
}
