import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { UserPolicy } from '../../../users/domain/policies/user.policy';
import { BlockEntity } from '../../domain/entities/block.entity';
import { BLOCK_REPOSITORY } from '../../domain/repositories/block.repository';
import type { BlockRepository } from '../../domain/repositories/block.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface PaginatedBlocks {
  items: BlockEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FindBlockedUsersUseCase {
  constructor(
    @Inject(BLOCK_REPOSITORY) private readonly blockRepository: BlockRepository,
  ) {}

  // A block list is private: only its owner may read it.
  async execute(
    actorId: string,
    blockerId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedBlocks> {
    if (!UserPolicy.canManage(actorId, blockerId)) {
      throw new ForbiddenException('You can only view your own block list');
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await this.blockRepository.findBlockedByUser({
      blockerId,
      page,
      limit,
    });

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    };
  }
}
