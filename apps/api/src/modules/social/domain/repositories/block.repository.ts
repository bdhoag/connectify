import { BlockEntity } from '../entities/block.entity';

export const BLOCK_REPOSITORY = Symbol('BLOCK_REPOSITORY');

export interface CreateBlockData {
  blockerId: string;
  blockedId: string;
}

export interface FindBlocksParams {
  blockerId: string;
  page: number;
  limit: number;
}

export interface FindBlocksResult {
  items: BlockEntity[];
  total: number;
}

export interface BlockRepository {
  // Throws a domain-friendly conflict error on a duplicate (blockerId, blockedId) pair.
  create(data: CreateBlockData): Promise<BlockEntity>;
  findOne(blockerId: string, blockedId: string): Promise<BlockEntity | null>;
  delete(blockerId: string, blockedId: string): Promise<boolean>;
  findBlockedByUser(params: FindBlocksParams): Promise<FindBlocksResult>;
}
