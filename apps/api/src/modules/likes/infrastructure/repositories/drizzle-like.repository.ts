import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { likes } from '../../../../database/schema';
import { LikeEntity } from '../../domain/entities/like.entity';
import {
  CreateLikeData,
  FindLikesByPostParams,
  FindLikesResult,
  LikeRepository,
} from '../../domain/repositories/like.repository';

type LikeRow = typeof likes.$inferSelect;

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class DrizzleLikeRepository implements LikeRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreateLikeData): Promise<LikeEntity> {
    try {
      const [row] = await this.db.insert(likes).values(data).returning();
      return this.toEntity(row);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('This post is already liked by this user');
      }
      throw error;
    }
  }

  async findOne(userId: string, postId: string): Promise<LikeEntity | null> {
    const row = await this.db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.postId, postId)),
    });
    return row ? this.toEntity(row) : null;
  }

  async findByPost(params: FindLikesByPostParams): Promise<FindLikesResult> {
    const where = eq(likes.postId, params.postId);

    const [rows, [{ value: total }]] = await Promise.all([
      this.db.query.likes.findMany({
        where,
        limit: params.limit,
        offset: (params.page - 1) * params.limit,
        orderBy: desc(likes.createdAt),
      }),
      this.db.select({ value: count() }).from(likes).where(where),
    ]);

    return { items: rows.map((row) => this.toEntity(row)), total };
  }

  async delete(userId: string, postId: string): Promise<boolean> {
    const rows = await this.db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .returning();
    return rows.length > 0;
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

  private toEntity(row: LikeRow): LikeEntity {
    return new LikeEntity({
      id: row.id,
      userId: row.userId,
      postId: row.postId,
      createdAt: row.createdAt,
    });
  }
}
