import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Gallery } from './gallery.entity';
import { User } from '../../users/entities/user.entity';
import { GALLERY_ACCESS_ROLES } from '../enums/gallery-role.enum';
import type { GalleryAccessRole } from '../enums/gallery-role.enum';

@Entity('gallery_access')
@Unique(['galleryId', 'userId'])
export class GalleryAccess {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'gallery_id' })
  galleryId!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({
    type: 'enum',
    enum: [...GALLERY_ACCESS_ROLES],
  })
  role!: GalleryAccessRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // relations
  @ManyToOne(() => Gallery, (gallery) => gallery.accesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gallery_id' })
  gallery!: Gallery;

  @ManyToOne(() => User, (user) => user.galleryAccesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
