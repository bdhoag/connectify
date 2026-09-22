import { Inject, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { LikeEntity } from '../../domain/entities/like.entity';
import { LIKE_REPOSITORY } from '../../domain/repositories/like.repository';
import type { LikeRepository } from '../../domain/repositories/like.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface PaginatedLikes {
  items: LikeEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FindLikesByPostUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY) private readonly likeRepository: LikeRepository,
  ) {}

  async execute(
    postId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedLikes> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await this.likeRepository.findByPost({
      postId,
      page,
      limit,
    });

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    };
  }
}
