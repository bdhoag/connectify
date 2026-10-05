import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserPolicy } from '../../domain/policies/user.policy';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(
    actorId: string,
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserEntity> {
    if (!UserPolicy.canManage(actorId, id)) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.userRepository.update(id, dto);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }
}
