import { Inject, Injectable } from '@nestjs/common';
import { and, count, asc, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { comments } from '../../../../database/schema';
import { CommentEntity } from '../../domain/entities/comment.entity';
import {
  CommentRepository,
  CreateCommentData,
  FindCommentsResult,
  FindRepliesParams,
  FindTopLevelCommentsParams,
  UpdateCommentData,
} from '../../domain/repositories/comment.repository';

type CommentRow = typeof comments.$inferSelect;

@Injectable()
export class DrizzleCommentRepository implements CommentRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreateCommentData): Promise<CommentEntity> {
    const [row] = await this.db.insert(comments).values(data).returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<CommentEntity | null> {
    const row = await this.db.query.comments.findFirst({
      where: and(eq(comments.id, id), isNull(comments.deletedAt)),
    });
    return row ? this.toEntity(row) : null;
  }

  async findTopLevelByPost(
    params: FindTopLevelCommentsParams,
  ): Promise<FindCommentsResult> {
    const where = and(
      eq(comments.postId, params.postId),
      isNull(comments.parentId),
      isNull(comments.deletedAt),
    );
    return this.findPage(where, params.page, params.limit);
  }

  async findReplies(params: FindRepliesParams): Promise<FindCommentsResult> {
    const where = and(
      eq(comments.parentId, params.parentId),
      isNull(comments.deletedAt),
    );
    return this.findPage(where, params.page, params.limit);
  }

  async update(
    id: string,
    data: UpdateCommentData,
  ): Promise<CommentEntity | null> {
    const [row] = await this.db
      .update(comments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async softDelete(id: string): Promise<CommentEntity | null> {
    const [row] = await this.db
      .update(comments)
      .set({ deletedAt: new Date() })
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  private async findPage(
    where: ReturnType<typeof and>,
    page: number,
    limit: number,
  ): Promise<FindCommentsResult> {
    const [rows, [{ value: total }]] = await Promise.all([
      this.db.query.comments.findMany({
        where,
        limit,
        offset: (page - 1) * limit,
        orderBy: asc(comments.createdAt),
      }),
      this.db.select({ value: count() }).from(comments).where(where),
    ]);

    return {
      items: rows.map((row) => this.toEntity(row)),
      total,
    };
  }

  private toEntity(row: CommentRow): CommentEntity {
    return new CommentEntity({
      id: row.id,
      postId: row.postId,
      authorId: row.authorId,
      parentId: row.parentId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
