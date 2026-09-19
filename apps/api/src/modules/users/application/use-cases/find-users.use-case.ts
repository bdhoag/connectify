import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { QueryUserDto } from '../dto/query-user.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface PaginatedUsers {
  items: UserEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FindUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(query: QueryUserDto): Promise<PaginatedUsers> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const { items, total } = await this.userRepository.findMany({
      page,
      limit,
      search: query.search,
      status: query.status,
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
