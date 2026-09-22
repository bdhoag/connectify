import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import { RoleEntity } from '../../domain/entities/role.entity';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import type { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class FindUserRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<RoleEntity[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
    return this.roleRepository.findByUserId(userId);
  }
}
