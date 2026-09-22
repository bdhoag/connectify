import { Inject, Injectable } from '@nestjs/common';
import { RoleEntity } from '../../domain/entities/role.entity';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import type { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class FindAllRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
  ) {}

  execute(): Promise<RoleEntity[]> {
    return this.roleRepository.findAll();
  }
}
