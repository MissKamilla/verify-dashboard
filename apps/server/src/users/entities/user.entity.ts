import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GalleryAccess } from '../../galleries/entities/gallery-access.entity';
import { Gallery } from '../../galleries/entities/gallery.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstname!: string;

  @Column()
  lastname!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  verifiedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // relations
  @OneToMany(() => Gallery, (gallery) => gallery.user)
  galleries!: Gallery[];

  @OneToMany(() => GalleryAccess, (access) => access.user)
  galleryAccesses!: GalleryAccess[];
}
