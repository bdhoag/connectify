import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, count, eq, ilike, ne, or, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { users } from '../../../../database/schema';
import { UserEntity, UserStatus } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  FindUsersParams,
  FindUsersResult,
  UpdateUserData,
  UserRepository,
} from '../../domain/repositories/user.repository';

type UserRow = typeof users.$inferSelect;

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreateUserData): Promise<UserEntity> {
    try {
      const [row] = await this.db.insert(users).values(data).returning();
      return this.toEntity(row);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'A user with this username or email already exists',
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.db.query.users.findFirst({
      where: and(eq(users.id, id), ne(users.status, UserStatus.DELETED)),
    });
    return row ? this.toEntity(row) : null;
  }

  async findMany(params: FindUsersParams): Promise<FindUsersResult> {
    const conditions: SQL[] = [];

    if (params.status) {
      conditions.push(eq(users.status, params.status));
    } else {
      conditions.push(ne(users.status, UserStatus.DELETED));
    }

    if (params.search) {
      const term = `%${params.search}%`;
      conditions.push(
        or(ilike(users.username, term), ilike(users.displayName, term))!,
      );
    }

    const where = and(...conditions);

    const [rows, [{ value: total }]] = await Promise.all([
      this.db.query.users.findMany({
        where,
        limit: params.limit,
        offset: (params.page - 1) * params.limit,
        orderBy: (usersTable, { desc }) => [desc(usersTable.createdAt)],
      }),
      this.db.select({ value: count() }).from(users).where(where),
    ]);

    return {
      items: rows.map((row) => this.toEntity(row)),
      total,
    };
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity | null> {
    const [row] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(users.id, id), ne(users.status, UserStatus.DELETED)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async softDelete(id: string): Promise<UserEntity | null> {
    const [row] = await this.db
      .update(users)
      .set({ status: UserStatus.DELETED, updatedAt: new Date() })
      .where(and(eq(users.id, id), ne(users.status, UserStatus.DELETED)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  private isUniqueViolation(error: unknown): boolean {
    return this.pgErrorCode(error) === POSTGRES_UNIQUE_VIOLATION;
  }

  // drizzle-orm wraps the underlying `pg` driver error, which carries the
  // Postgres error code, inside its own error's `cause` property.
  private pgErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    if ('cause' in error) {
      return this.pgErrorCode(error.cause);
    }
    return undefined;
  }

  private toEntity(row: UserRow): UserEntity {
    return new UserEntity({
      id: row.id,
      username: row.username,
      email: row.email,
      status: row.status as UserStatus,
      displayName: row.displayName,
      bio: row.bio,
      avatarUrl: row.avatarUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
