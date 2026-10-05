import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolePolicy } from '../../domain/policies/role.policy';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import type { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class RemoveRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
  ) {}

  async execute(
    actorId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    const actorRoles = await this.roleRepository.findByUserId(actorId);
    if (!RolePolicy.canManageRoles(actorRoles)) {
      throw new ForbiddenException('Only an admin can remove roles');
    }

    const removed = await this.roleRepository.removeRole(userId, roleId);
    if (!removed) {
      throw new NotFoundException(
        `User "${userId}" does not have role "${roleId}"`,
      );
    }
  }
}
