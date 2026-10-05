import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { PostPolicy } from '../../domain/policies/post.policy';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    dto: UpdatePostDto,
  ): Promise<PostEntity> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    if (!PostPolicy.canUpdate(userId, post)) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    const updated = await this.postRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return updated;
  }
}
