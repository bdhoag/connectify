import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AssignRoleUseCase } from './application/use-cases/assign-role.use-case';
import { FindAllRolesUseCase } from './application/use-cases/find-all-roles.use-case';
import { FindUserRolesUseCase } from './application/use-cases/find-user-roles.use-case';
import { RemoveRoleUseCase } from './application/use-cases/remove-role.use-case';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository';
import { DrizzleRoleRepository } from './infrastructure/repositories/drizzle-role.repository';
import { RolesController } from './presentation/controllers/roles.controller';

@Module({
  imports: [UsersModule],
  controllers: [RolesController],
  providers: [
    { provide: ROLE_REPOSITORY, useClass: DrizzleRoleRepository },
    FindAllRolesUseCase,
    FindUserRolesUseCase,
    AssignRoleUseCase,
    RemoveRoleUseCase,
  ],
  exports: [ROLE_REPOSITORY],
})
export class RolesModule {}
