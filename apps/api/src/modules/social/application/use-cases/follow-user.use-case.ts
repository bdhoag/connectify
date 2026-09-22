import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { FollowEntity } from '../../domain/entities/follow.entity';
import { BLOCK_REPOSITORY } from '../../domain/repositories/block.repository';
import type { BlockRepository } from '../../domain/repositories/block.repository';
import { FOLLOW_REPOSITORY } from '../../domain/repositories/follow.repository';
import type { FollowRepository } from '../../domain/repositories/follow.repository';
import { FollowUserDto } from '../dto/follow-user.dto';

@Injectable()
export class FollowUserUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
    @Inject(BLOCK_REPOSITORY) private readonly blockRepository: BlockRepository,
  ) {}

  async execute(followingId: string, dto: FollowUserDto): Promise<FollowEntity> {
    if (dto.followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // Domain rule: a blocked user cannot follow the user who blocked them.
    const blockedByTarget = await this.blockRepository.findOne(
      followingId,
      dto.followerId,
    );
    if (blockedByTarget) {
      throw new ForbiddenException('You cannot follow a user who has blocked you');
    }

    return this.followRepository.create({
      followerId: dto.followerId,
      followingId,
    });
  }
}
