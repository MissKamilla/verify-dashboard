import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { GalleryRole } from '../enums/gallery-role.enum';
import { Gallery } from './gallery.entity';

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
    enum: GalleryRole,
  })
  role!: GalleryRole;

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
