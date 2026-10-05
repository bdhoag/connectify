import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FOLLOW_REPOSITORY } from '../../domain/repositories/follow.repository';
import type { FollowRepository } from '../../domain/repositories/follow.repository';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    const deleted = await this.followRepository.delete(followerId, followingId);
    if (!deleted) {
      throw new NotFoundException(
        `You are not following user "${followingId}"`,
      );
    }
  }
}
