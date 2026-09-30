import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, ne } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import {
  refreshTokens,
  userCredentials,
  users,
} from '../../../../database/schema';
import {
  UserEntity,
  UserStatus,
} from '../../../users/domain/entities/user.entity';
import {
  AuthRepository,
  CreateRefreshTokenData,
  RefreshTokenRecord,
  RegisterUserData,
  UserWithPasswordHash,
} from '../../domain/repositories/auth.repository';

type UserRow = typeof users.$inferSelect;
type RefreshTokenRow = typeof refreshTokens.$inferSelect;

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class DrizzleAuthRepository implements AuthRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async registerUser(data: RegisterUserData): Promise<UserEntity> {
    try {
      return await this.db.transaction(async (tx) => {
        const [userRow] = await tx
          .insert(users)
          .values({
            username: data.username,
            email: data.email,
            displayName: data.displayName,
          })
          .returning();

        await tx.insert(userCredentials).values({
          userId: userRow.id,
          passwordHash: data.passwordHash,
        });

        return this.toUserEntity(userRow);
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'A user with this username or email already exists',
        );
      }
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.status, UserStatus.DELETED)),
    });
    return row ? this.toUserEntity(row) : null;
  }

  async findUserByUsername(username: string): Promise<UserEntity | null> {
    const row = await this.db.query.users.findFirst({
      where: and(
        eq(users.username, username),
        ne(users.status, UserStatus.DELETED),
      ),
    });
    return row ? this.toUserEntity(row) : null;
  }

  async findUserWithPasswordHashByEmail(
    email: string,
  ): Promise<UserWithPasswordHash | null> {
    const row = await this.db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.status, UserStatus.DELETED)),
      with: { credentials: true },
    });

    if (!row?.credentials) {
      return null;
    }

    return {
      user: this.toUserEntity(row),
      passwordHash: row.credentials.passwordHash,
    };
  }

  async createRefreshToken(
    data: CreateRefreshTokenData,
  ): Promise<RefreshTokenRecord> {
    const [row] = await this.db.insert(refreshTokens).values(data).returning();
    return this.toRefreshTokenRecord(row);
  }

  async findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRecord | null> {
    const row = await this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    });
    return row ? this.toRefreshTokenRecord(row) : null;
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.id, id), isNull(refreshTokens.revokedAt)));
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
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

  private toUserEntity(row: UserRow): UserEntity {
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

  private toRefreshTokenRecord(row: RefreshTokenRow): RefreshTokenRecord {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    };
  }
}
