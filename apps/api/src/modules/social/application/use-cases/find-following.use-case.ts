import { Inject, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { FOLLOW_REPOSITORY } from '../../domain/repositories/follow.repository';
import type { FollowRepository } from '../../domain/repositories/follow.repository';
import { PaginatedFollows } from './find-followers.use-case';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class FindFollowingUseCase {
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

    const { items, total } = await this.followRepository.findFollowing({
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
