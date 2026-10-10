import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, isNull, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { postMedia, posts } from '../../../../database/schema';
import { PostEntity } from '../../domain/entities/post.entity';
import {
  CreatePostData,
  FindPostsParams,
  FindPostsResult,
  PostRepository,
  UpdatePostData,
} from '../../domain/repositories/post.repository';

type PostRow = typeof posts.$inferSelect;
type PostMediaRow = typeof postMedia.$inferSelect;

// Media in the order the author attached it.
const withMedia = {
  media: { orderBy: [asc(postMedia.position)] },
};

@Injectable()
export class DrizzlePostRepository implements PostRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreatePostData): Promise<PostEntity> {
    const { media, ...postData } = data;

    // The post and its media are one unit: no post without its images.
    return this.db.transaction(async (tx) => {
      const [row] = await tx.insert(posts).values(postData).returning();
      const mediaRows = media.length
        ? await tx
            .insert(postMedia)
            .values(
              media.map((item, position) => ({
                postId: row.id,
                mediaUrl: item.url,
                publicId: item.publicId,
                mediaType: 'IMAGE' as const,
                position,
              })),
            )
            .returning()
        : [];
      return this.toEntity(row, mediaRows);
    });
  }

  async findById(id: string): Promise<PostEntity | null> {
    const row = await this.db.query.posts.findFirst({
      where: and(eq(posts.id, id), isNull(posts.deletedAt)),
      with: withMedia,
    });
    return row ? this.toEntity(row, row.media) : null;
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
        with: withMedia,
      }),
      this.db.select({ value: count() }).from(posts).where(where),
    ]);

    return {
      items: rows.map((row) => this.toEntity(row, row.media)),
      total,
    };
  }

  async update(id: string, data: UpdatePostData): Promise<PostEntity | null> {
    const [row] = await this.db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();
    return row ? this.toEntity(row, await this.findMedia(row.id)) : null;
  }

  async softDelete(id: string): Promise<PostEntity | null> {
    const [row] = await this.db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();
    return row ? this.toEntity(row, await this.findMedia(row.id)) : null;
  }

  private findMedia(postId: string): Promise<PostMediaRow[]> {
    return this.db
      .select()
      .from(postMedia)
      .where(eq(postMedia.postId, postId))
      .orderBy(asc(postMedia.position));
  }

  private toEntity(row: PostRow, mediaRows: PostMediaRow[]): PostEntity {
    return new PostEntity({
      id: row.id,
      authorId: row.authorId,
      content: row.content,
      media: mediaRows.map((m) => ({
        id: m.id,
        url: m.mediaUrl,
        publicId: m.publicId,
        type: m.mediaType,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
