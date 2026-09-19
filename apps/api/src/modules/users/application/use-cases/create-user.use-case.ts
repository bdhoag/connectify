import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  execute(dto: CreateUserDto): Promise<UserEntity> {
    return this.userRepository.create(dto);
  }
}
