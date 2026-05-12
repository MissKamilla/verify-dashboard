import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';
import { Repository } from 'typeorm';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { CreateGalleryDto } from './dto/create-gallery.dto';

@Injectable()
export class GalleriesService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleriesRepository: Repository<Gallery>,
  ) {}

  async createGallery(userId: number, dto: CreateGalleryDto): Promise<Gallery> {
    const existingGallery = await this.galleriesRepository.findOne({
      where: {
        userId,
        title: dto.title,
      },
    });

    if (existingGallery) {
      throw new ConflictException('Gallery with this title already exists');
    }

    const gallery = this.galleriesRepository.create({
      ...dto,
      userId,
    });

    return this.galleriesRepository.save(gallery);
  }

  findAll(userId: number): Promise<Gallery[]> {
    return this.galleriesRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(id: number, userId: number): Promise<Gallery> {
    const gallery = await this.galleriesRepository.findOne({
      where: { id, userId },
    });

    if (!gallery) {
      throw new NotFoundException('Gallery not found');
    }

    return gallery;
  }

  async updateGallery(
    id: number,
    userId: number,
    dto: UpdateGalleryDto,
  ): Promise<Gallery> {
    const gallery = await this.findById(id, userId);

    if (dto.title && dto.title !== gallery.title) {
      const existingGallery = await this.galleriesRepository.findOne({
        where: {
          userId,
          title: dto.title,
        },
      });

      if (existingGallery) {
        throw new ConflictException('Gallery with this title already exists');
      }
    }

    Object.assign(gallery, dto);

    return this.galleriesRepository.save(gallery);
  }

  async removeGallery(id: number, userId: number): Promise<void> {
    const gallery = await this.findById(id, userId);

    await this.galleriesRepository.remove(gallery);
  }
}
