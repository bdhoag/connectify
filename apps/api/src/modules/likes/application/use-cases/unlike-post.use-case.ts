import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LIKE_REPOSITORY } from '../../domain/repositories/like.repository';
import type { LikeRepository } from '../../domain/repositories/like.repository';
import { LikePostDto } from '../dto/like-post.dto';

@Injectable()
export class UnlikePostUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY) private readonly likeRepository: LikeRepository,
  ) {}

  async execute(postId: string, dto: LikePostDto): Promise<void> {
    const deleted = await this.likeRepository.delete(dto.userId, postId);
    if (!deleted) {
      throw new NotFoundException(
        `Post "${postId}" is not liked by user "${dto.userId}"`,
      );
    }
  }
}
