import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LIKE_REPOSITORY } from '../../domain/repositories/like.repository';
import type { LikeRepository } from '../../domain/repositories/like.repository';

@Injectable()
export class UnlikePostUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY) private readonly likeRepository: LikeRepository,
  ) {}

  async execute(userId: string, postId: string): Promise<void> {
    const deleted = await this.likeRepository.delete(userId, postId);
    if (!deleted) {
      throw new NotFoundException(`Post "${postId}" is not liked by you`);
    }
  }
}
