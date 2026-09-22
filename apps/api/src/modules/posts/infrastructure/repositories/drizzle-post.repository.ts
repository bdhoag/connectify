import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { posts } from '../../../../database/schema';
import { PostEntity } from '../../domain/entities/post.entity';
import {
  CreatePostData,
  FindPostsParams,
  FindPostsResult,
  PostRepository,
  UpdatePostData,
} from '../../domain/repositories/post.repository';

type PostRow = typeof posts.$inferSelect;

@Injectable()
export class DrizzlePostRepository implements PostRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreatePostData): Promise<PostEntity> {
    const [row] = await this.db.insert(posts).values(data).returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<PostEntity | null> {
    const row = await this.db.query.posts.findFirst({
      where: and(eq(posts.id, id), isNull(posts.deletedAt)),
    });
    return row ? this.toEntity(row) : null;
  }

  async findMany(params: FindPostsParams): Promise<FindPostsResult> {
    const conditions: SQL[] = [isNull(posts.deletedAt)];

    if (params.authorId) {
      conditions.push(eq(posts.authorId, params.authorId));
    }

    const where = and(...conditions);

    const [rows, [{ value: total }]] = await Promise.all([
      this.db.query.posts.findMany({
        where,
        limit: params.limit,
        offset: (params.page - 1) * params.limit,
        orderBy: desc(posts.createdAt),
      }),
      this.db.select({ value: count() }).from(posts).where(where),
    ]);

    return {
      items: rows.map((row) => this.toEntity(row)),
      total,
    };
  }

  async update(id: string, data: UpdatePostData): Promise<PostEntity | null> {
    const [row] = await this.db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async softDelete(id: string): Promise<PostEntity | null> {
    const [row] = await this.db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: PostRow): PostEntity {
    return new PostEntity({
      id: row.id,
      authorId: row.authorId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
