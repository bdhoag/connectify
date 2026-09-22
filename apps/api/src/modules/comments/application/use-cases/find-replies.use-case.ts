import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { PaginatedComments } from './find-comments.use-case';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class FindRepliesUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(
    parentId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedComments> {
    const parent = await this.commentRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Comment with id "${parentId}" not found`);
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await this.commentRepository.findReplies({
      parentId,
      page,
      limit,
    });

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    };
  }
}
