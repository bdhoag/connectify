import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FOLLOW_REPOSITORY } from '../../domain/repositories/follow.repository';
import type { FollowRepository } from '../../domain/repositories/follow.repository';
import { FollowUserDto } from '../dto/follow-user.dto';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(followingId: string, dto: FollowUserDto): Promise<void> {
    const deleted = await this.followRepository.delete(
      dto.followerId,
      followingId,
    );
    if (!deleted) {
      throw new NotFoundException(
        `User "${dto.followerId}" is not following user "${followingId}"`,
      );
    }
  }
}
