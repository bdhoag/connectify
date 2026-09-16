import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { roles, userRoles } from '../../database/schema';

export type Role = typeof roles.$inferSelect;

@Injectable()
export class RolesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  findAll(): Promise<Role[]> {
    return this.db.query.roles.findMany();
  }

  findByName(name: string): Promise<Role | undefined> {
    return this.db.query.roles.findFirst({ where: eq(roles.name, name) });
  }

  listForUser(userId: string): Promise<Role[]> {
    return this.db.query.userRoles
      .findMany({
        where: eq(userRoles.userId, userId),
        with: { role: true },
      })
      .then((rows) => rows.map((row) => row.role));
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.db
      .insert(userRoles)
      .values({ userId, roleId })
      .onConflictDoNothing();
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  }

  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    const [row] = await this.db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(roles.name, roleName)))
      .limit(1);
    return !!row;
  }
}
