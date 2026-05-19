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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
