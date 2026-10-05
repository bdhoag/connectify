import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPolicy } from '../../domain/policies/user.policy';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(actorId: string, id: string): Promise<void> {
    if (!UserPolicy.canManage(actorId, id)) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.userRepository.softDelete(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
  }
}
