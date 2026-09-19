import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.update(id, dto);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }
}
