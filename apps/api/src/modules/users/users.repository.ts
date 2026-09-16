import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { users } from '../../database/schema';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  findById(id: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }

  findByEmail(email: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({ where: eq(users.email, email) });
  }

  findByUsername(username: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(users.username, username),
    });
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async updateProfile(
    id: string,
    data: Partial<Pick<NewUser, 'displayName' | 'bio' | 'avatarUrl'>>,
  ): Promise<User | undefined> {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateStatus(
    id: string,
    status: User['status'],
  ): Promise<User | undefined> {
    const [user] = await this.db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}
