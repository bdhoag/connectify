import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import { RoleEntity } from '../../domain/entities/role.entity';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import type { RoleRepository } from '../../domain/repositories/role.repository';
import { AssignRoleDto } from '../dto/assign-role.dto';

@Injectable()
export class AssignRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string, dto: AssignRoleDto): Promise<RoleEntity[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    const role = await this.roleRepository.findByName(dto.roleName);
    if (!role) {
      throw new NotFoundException(`Role "${dto.roleName}" not found`);
    }

    await this.roleRepository.assignRole(userId, role.id);
    return this.roleRepository.findByUserId(userId);
  }
}
