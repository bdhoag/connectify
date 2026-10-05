import { ForbiddenException } from '@nestjs/common';
import { RoleEntity, RoleName } from '../../domain/entities/role.entity';
import { RolePolicy } from '../../domain/policies/role.policy';
import { AssignRoleUseCase } from './assign-role.use-case';
import { RemoveRoleUseCase } from './remove-role.use-case';

const role = (name: RoleName) =>
  new RoleEntity({ id: `${name}-id`, name, createdAt: new Date() });

function setup(actorRoles: RoleEntity[]) {
  const roleRepo = {
    findAll: jest.fn(),
    findByName: jest.fn().mockResolvedValue(role(RoleName.MODERATOR)),
    findByUserId: jest.fn().mockResolvedValue(actorRoles),
    assignRole: jest.fn().mockResolvedValue(undefined),
    removeRole: jest.fn().mockResolvedValue(true),
  };
  const userRepo = { findById: jest.fn().mockResolvedValue({ id: 'target' }) };
  return { roleRepo, userRepo };
}

describe('RolePolicy', () => {
  it('only admins may manage roles', () => {
    expect(RolePolicy.canManageRoles([role(RoleName.ADMIN)])).toBe(true);
    expect(
      RolePolicy.canManageRoles([
        role(RoleName.USER),
        role(RoleName.MODERATOR),
      ]),
    ).toBe(false);
    expect(RolePolicy.canManageRoles([])).toBe(false);
  });
});

describe('AssignRoleUseCase / RemoveRoleUseCase', () => {
  it('lets an admin assign and remove roles', async () => {
    const { roleRepo, userRepo } = setup([role(RoleName.ADMIN)]);
    await new AssignRoleUseCase(roleRepo, userRepo as never).execute(
      'admin',
      'target',
      { roleName: RoleName.MODERATOR },
    );
    await new RemoveRoleUseCase(roleRepo).execute('admin', 'target', 'role-id');
    expect(roleRepo.assignRole).toHaveBeenCalled();
    expect(roleRepo.removeRole).toHaveBeenCalled();
  });

  it('stops a regular user from granting themselves a role', async () => {
    const { roleRepo, userRepo } = setup([role(RoleName.USER)]);
    await expect(
      new AssignRoleUseCase(roleRepo, userRepo as never).execute('me', 'me', {
        roleName: RoleName.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new RemoveRoleUseCase(roleRepo).execute('me', 'target', 'role-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(roleRepo.assignRole).not.toHaveBeenCalled();
    expect(roleRepo.removeRole).not.toHaveBeenCalled();
  });
});
