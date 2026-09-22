import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  // TODO: enforce ownership (post.authorId === currentUser.id, unless
  // MODERATOR/ADMIN) once auth guards/decorators exist.
  async execute(id: string, dto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.postRepository.update(id, dto);
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return post;
  }
}
