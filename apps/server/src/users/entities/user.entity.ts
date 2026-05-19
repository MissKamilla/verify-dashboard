import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToMany(() => Gallery, (gallery) => gallery.user)
  galleries!: Gallery[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
