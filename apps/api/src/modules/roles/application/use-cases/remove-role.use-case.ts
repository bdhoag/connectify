import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import type { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class RemoveRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
  ) {}

  async execute(userId: string, roleId: string): Promise<void> {
    const removed = await this.roleRepository.removeRole(userId, roleId);
    if (!removed) {
      throw new NotFoundException(
        `User "${userId}" does not have role "${roleId}"`,
      );
    }
  }
}
