import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id!: number;
  @Column() firstname!: string;
  @Column() lastname!: string;
  @Column({ unique: true }) email!: string;
  @Column({ select: false }) password!: string;
  @CreateDateColumn() createdAt!: Date;
}
