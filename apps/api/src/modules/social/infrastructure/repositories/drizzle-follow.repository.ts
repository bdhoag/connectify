import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { follows } from '../../../../database/schema';
import { FollowEntity } from '../../domain/entities/follow.entity';
import {
  CreateFollowData,
  FindFollowsParams,
  FindFollowsResult,
  FollowRepository,
} from '../../domain/repositories/follow.repository';

type FollowRow = typeof follows.$inferSelect;

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class DrizzleFollowRepository implements FollowRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreateFollowData): Promise<FollowEntity> {
    try {
      const [row] = await this.db.insert(follows).values(data).returning();
      return this.toEntity(row);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Already following this user');
      }
      throw error;
    }
  }

  async findOne(
    followerId: string,
    followingId: string,
  ): Promise<FollowEntity | null> {
    const row = await this.db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId),
      ),
    });
    return row ? this.toEntity(row) : null;
  }

  async delete(followerId: string, followingId: string): Promise<boolean> {
    const rows = await this.db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId),
        ),
      )
      .returning();
    return rows.length > 0;
  }

  async findFollowers(params: FindFollowsParams): Promise<FindFollowsResult> {
    return this.findPage(eq(follows.followingId, params.userId), params);
  }

  async findFollowing(params: FindFollowsParams): Promise<FindFollowsResult> {
    return this.findPage(eq(follows.followerId, params.userId), params);
  }

  private async findPage(
    where: ReturnType<typeof eq>,
    { page, limit }: FindFollowsParams,
  ): Promise<FindFollowsResult> {
    const [rows, [{ value: total }]] = await Promise.all([
      this.db.query.follows.findMany({
        where,
        limit,
        offset: (page - 1) * limit,
        orderBy: desc(follows.createdAt),
      }),
      this.db.select({ value: count() }).from(follows).where(where),
    ]);

    return { items: rows.map((row) => this.toEntity(row)), total };
  }

  private isUniqueViolation(error: unknown): boolean {
    return this.pgErrorCode(error) === POSTGRES_UNIQUE_VIOLATION;
  }

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

  private toEntity(row: FollowRow): FollowEntity {
    return new FollowEntity({
      id: row.id,
      followerId: row.followerId,
      followingId: row.followingId,
      createdAt: row.createdAt,
    });
  }
}
