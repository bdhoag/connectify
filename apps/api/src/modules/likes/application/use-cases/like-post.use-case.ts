import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { POST_REPOSITORY } from '../../../posts/domain/repositories/post.repository';
import type { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { LikeEntity } from '../../domain/entities/like.entity';
import { LIKE_REPOSITORY } from '../../domain/repositories/like.repository';
import type { LikeRepository } from '../../domain/repositories/like.repository';
import { LikePostDto } from '../dto/like-post.dto';

@Injectable()
export class LikePostUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY) private readonly likeRepository: LikeRepository,
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  async execute(postId: string, dto: LikePostDto): Promise<LikeEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with id "${postId}" not found`);
    }

    // LikeRepository.create() throws ConflictException on a duplicate
    // (userId, postId) pair — "a user cannot like the same post twice".
    return this.likeRepository.create({ userId: dto.userId, postId });
  }
}
