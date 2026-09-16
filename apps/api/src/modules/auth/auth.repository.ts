import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { userCredentials, refreshTokens } from '../../database/schema';

export type UserCredentials = typeof userCredentials.$inferSelect;
export type NewUserCredentials = typeof userCredentials.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

@Injectable()
export class AuthRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  findCredentialsByUserId(
    userId: string,
  ): Promise<UserCredentials | undefined> {
    return this.db.query.userCredentials.findFirst({
      where: eq(userCredentials.userId, userId),
    });
  }

  async createCredentials(data: NewUserCredentials): Promise<UserCredentials> {
    const [credentials] = await this.db
      .insert(userCredentials)
      .values(data)
      .returning();
    return credentials;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<UserCredentials | undefined> {
    const [credentials] = await this.db
      .update(userCredentials)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(userCredentials.userId, userId))
      .returning();
    return credentials;
  }

  async createRefreshToken(data: NewRefreshToken): Promise<RefreshToken> {
    const [token] = await this.db
      .insert(refreshTokens)
      .values(data)
      .returning();
    return token;
  }

  findActiveRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshToken | undefined> {
    return this.db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
      ),
    });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, id));
  }
}
