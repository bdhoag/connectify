import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { roles, userRoles } from '../../../../database/schema';
import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleRepository } from '../../domain/repositories/role.repository';

type RoleRow = typeof roles.$inferSelect;

@Injectable()
export class DrizzleRoleRepository implements RoleRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findAll(): Promise<RoleEntity[]> {
    const rows = await this.db.query.roles.findMany();
    return rows.map((row) => this.toEntity(row));
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const row = await this.db.query.roles.findFirst({
      where: eq(roles.name, name),
    });
    return row ? this.toEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<RoleEntity[]> {
    const rows = await this.db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
      with: { role: true },
    });
    return rows.map((row) => this.toEntity(row.role));
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.db
      .insert(userRoles)
      .values({ userId, roleId })
      .onConflictDoNothing();
  }

  async removeRole(userId: string, roleId: string): Promise<boolean> {
    const rows = await this.db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .returning();
    return rows.length > 0;
  }

  private toEntity(row: RoleRow): RoleEntity {
    return new RoleEntity({ id: row.id, name: row.name, createdAt: row.createdAt });
  }
}
