import { Inject, Injectable } from '@nestjs/common';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface PaginatedComments {
  items: CommentEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Lists top-level comments for a post (parentId IS NULL); replies are
// fetched separately via FindRepliesUseCase.
@Injectable()
export class FindCommentsUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(
    postId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedComments> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await this.commentRepository.findTopLevelByPost({
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
