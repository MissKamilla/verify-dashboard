import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { GalleryImage } from '../../images/entities/image.entity';
import { User } from '../../users/entities/user.entity';
import { GalleryAccess } from './gallery-access.entity';

@Entity('galleries')
@Unique(['userId', 'title'])
export class Gallery {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  title!: string;

  @Column({ length: 255, default: '' })
  description!: string;

  @Column({ name: 'user_id' })
  userId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // relations
  @ManyToOne(() => User, (user) => user.galleries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => GalleryImage, (image) => image.gallery)
  images!: GalleryImage[];

  @OneToMany(() => GalleryAccess, (access) => access.gallery)
  accesses!: GalleryAccess[];
}
