import { RoleEntity } from '../entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepository {
  findAll(): Promise<RoleEntity[]>;
  findByName(name: string): Promise<RoleEntity | null>;
  findByUserId(userId: string): Promise<RoleEntity[]>;
  // Idempotent: assigning a role the user already holds is a no-op.
  assignRole(userId: string, roleId: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<boolean>;
}
