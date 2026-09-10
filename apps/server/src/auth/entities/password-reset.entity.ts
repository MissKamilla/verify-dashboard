import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('password_resets')
@Index(['tokenHash'], { unique: true })
@Index(['userId'], { unique: true })
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column()
  tokenHash!: string;

  @Column({
    type: 'timestamptz',
  })
  expiresAt!: Date;

  @Column({
    type: 'timestamptz',
  })
  lastSentAt!: Date;

  // relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
