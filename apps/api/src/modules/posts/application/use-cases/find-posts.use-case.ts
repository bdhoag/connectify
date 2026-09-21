import { Inject, Injectable } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';
import { QueryPostDto } from '../dto/query-post.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface PaginatedPosts {
  items: PostEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FindPostsUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  async execute(query: QueryPostDto): Promise<PaginatedPosts> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await this.postRepository.findMany({
      page,
      limit,
      authorId: query.authorId,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }
}
