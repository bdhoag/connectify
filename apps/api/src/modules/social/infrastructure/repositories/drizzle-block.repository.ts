import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { blocks } from '../../../../database/schema';
import { BlockEntity } from '../../domain/entities/block.entity';
import {
  BlockRepository,
  CreateBlockData,
  FindBlocksParams,
  FindBlocksResult,
} from '../../domain/repositories/block.repository';

type BlockRow = typeof blocks.$inferSelect;

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class DrizzleBlockRepository implements BlockRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreateBlockData): Promise<BlockEntity> {
    try {
      const [row] = await this.db.insert(blocks).values(data).returning();
      return this.toEntity(row);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Already blocking this user');
      }
      throw error;
    }
  }

  async findOne(
    blockerId: string,
    blockedId: string,
  ): Promise<BlockEntity | null> {
    const row = await this.db.query.blocks.findFirst({
      where: and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)),
    });
    return row ? this.toEntity(row) : null;
  }

  async delete(blockerId: string, blockedId: string): Promise<boolean> {
    const rows = await this.db
      .delete(blocks)
      .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)))
      .returning();
    return rows.length > 0;
  }

  async findBlockedByUser(params: FindBlocksParams): Promise<FindBlocksResult> {
    const where = eq(blocks.blockerId, params.blockerId);

    const [rows, [{ value: total }]] = await Promise.all([
      this.db.query.blocks.findMany({
        where,
        limit: params.limit,
        offset: (params.page - 1) * params.limit,
        orderBy: desc(blocks.createdAt),
      }),
      this.db.select({ value: count() }).from(blocks).where(where),
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

  private toEntity(row: BlockRow): BlockEntity {
    return new BlockEntity({
      id: row.id,
      blockerId: row.blockerId,
      blockedId: row.blockedId,
      createdAt: row.createdAt,
    });
  }
}
