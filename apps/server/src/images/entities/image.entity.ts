import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Gallery } from '../../galleries/entities/gallery.entity';

type ImageMetafields = {
  name?: string;
  comment?: string;
};

@Entity('images')
export class GalleryImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 500 })
  path!: string;

  @Index()
  @Column({ name: 'gallery_id' })
  galleryId!: number;

  @ManyToOne(() => Gallery, (gallery) => gallery.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gallery_id' })
  gallery!: Gallery;

  @Column({ name: 'original_filename', length: 255 })
  originalFilename!: string;

  @Column({
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  metafields!: ImageMetafields;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
