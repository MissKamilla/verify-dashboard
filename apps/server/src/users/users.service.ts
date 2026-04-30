import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

type CreateUserData = Pick<
  User,
  'firstname' | 'lastname' | 'email' | 'password'
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(
    email: string,
    options?: { withPassword?: boolean },
  ): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (options?.withPassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  async findById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  createUser(data: CreateUserData): Promise<User> {
    const user = this.usersRepository.create(data);

    return this.usersRepository.save(user);
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      user.email = dto.email;
    }

    if (dto.firstname) {
      user.firstname = dto.firstname;
    }

    if (dto.lastname) {
      user.lastname = dto.lastname;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    const updateUser = await this.usersRepository.save(user);

    return updateUser;
  }
}
