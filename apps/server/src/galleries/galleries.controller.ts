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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GalleriesService } from './galleries.service';
import { GalleryResponseDto } from './dto/gallery-response.dto';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetGalleriesQueryDto } from './dto/get-galleries-query.dto';
import { GalleriesListResponseDto } from './dto/galleries-list-response.dto';

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
}
