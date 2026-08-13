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
import {
  GALLERY_ACCESS_ROLES,
  type GalleryAccessRole,
} from '../enums/gallery-role.enum';

@Entity('gallery_invitations')
@Unique(['galleryId', 'email'])
export class GalleryInvitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'gallery_id' })
  galleryId!: number;

  @Column()
  email!: string;

  @Column({
    type: 'enum',
    enum: [...GALLERY_ACCESS_ROLES],
  })
  role!: GalleryAccessRole;

  @Column({ unique: true })
  tokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // relations

  @ManyToOne(() => Gallery, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gallery_id' })
  gallery!: Gallery;
}
