import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';

@Injectable()
export class FindPostByIdUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  async execute(id: string): Promise<PostEntity> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return post;
  }
}
