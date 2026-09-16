import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { blocks, follows } from '../../database/schema';

export type Follow = typeof follows.$inferSelect;
export type Block = typeof blocks.$inferSelect;

@Injectable()
export class SocialRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async follow(followerId: string, followingId: string): Promise<void> {
    await this.db
      .insert(follows)
      .values({ followerId, followingId })
      .onConflictDoNothing();
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId),
        ),
      );
  }

  isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<Follow | undefined> {
    return this.db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId),
      ),
    });
  }

  listFollowers(userId: string) {
    return this.db.query.follows.findMany({
      where: eq(follows.followingId, userId),
      with: { follower: true },
    });
  }

  listFollowing(userId: string) {
    return this.db.query.follows.findMany({
      where: eq(follows.followerId, userId),
      with: { following: true },
    });
  }

  async block(blockerId: string, blockedId: string): Promise<void> {
    await this.db
      .insert(blocks)
      .values({ blockerId, blockedId })
      .onConflictDoNothing();
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    await this.db
      .delete(blocks)
      .where(
        and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)),
      );
  }

  isBlocked(blockerId: string, blockedId: string): Promise<Block | undefined> {
    return this.db.query.blocks.findFirst({
      where: and(
        eq(blocks.blockerId, blockerId),
        eq(blocks.blockedId, blockedId),
      ),
    });
  }

  listBlocked(userId: string) {
    return this.db.query.blocks.findMany({
      where: eq(blocks.blockerId, userId),
      with: { blocked: true },
    });
  }
}
