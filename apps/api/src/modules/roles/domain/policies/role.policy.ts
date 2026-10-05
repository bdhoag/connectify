import { RoleEntity, RoleName } from '../entities/role.entity';

// Role assignment is the one place that must not be self-service, otherwise
// any user could grant themselves ADMIN. This is a single explicit rule, not a
// permission system; `actorRoles` are the roles currently held by the caller.
export class RolePolicy {
  static canManageRoles(actorRoles: RoleEntity[]): boolean {
    return actorRoles.some((role) => role.name === (RoleName.ADMIN as string));
  }
}
