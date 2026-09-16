import { Module } from '@nestjs/common';
import { RolesRepository } from './roles.repository';

// No controller/service yet — RBAC guards and role-management endpoints are TODO.
@Module({
  providers: [RolesRepository],
  exports: [RolesRepository],
})
export class RolesModule {}
