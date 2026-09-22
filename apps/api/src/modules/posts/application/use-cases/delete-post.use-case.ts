import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  // TODO: enforce ownership (post.authorId === currentUser.id, unless
  // MODERATOR/ADMIN) once auth guards/decorators exist.
  async execute(id: string): Promise<void> {
    const post = await this.postRepository.softDelete(id);
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
  }
}
