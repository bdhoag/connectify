import { Inject, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { FollowEntity } from '../../domain/entities/follow.entity';
import { FOLLOW_REPOSITORY } from '../../domain/repositories/follow.repository';
import type { FollowRepository } from '../../domain/repositories/follow.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface PaginatedFollows {
  items: FollowEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FindFollowersUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedFollows> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await this.followRepository.findFollowers({
      userId,
      page,
      limit,
    });

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    };
  }
}
