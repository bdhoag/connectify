import { Module } from '@nestjs/common';
import { BlockUserUseCase } from './application/use-cases/block-user.use-case';
import { FindBlockedUsersUseCase } from './application/use-cases/find-blocked-users.use-case';
import { FindFollowersUseCase } from './application/use-cases/find-followers.use-case';
import { FindFollowingUseCase } from './application/use-cases/find-following.use-case';
import { FollowUserUseCase } from './application/use-cases/follow-user.use-case';
import { UnblockUserUseCase } from './application/use-cases/unblock-user.use-case';
import { UnfollowUserUseCase } from './application/use-cases/unfollow-user.use-case';
import { BLOCK_REPOSITORY } from './domain/repositories/block.repository';
import { FOLLOW_REPOSITORY } from './domain/repositories/follow.repository';
import { DrizzleBlockRepository } from './infrastructure/repositories/drizzle-block.repository';
import { DrizzleFollowRepository } from './infrastructure/repositories/drizzle-follow.repository';
import { SocialController } from './presentation/controllers/social.controller';

@Module({
  controllers: [SocialController],
  providers: [
    { provide: FOLLOW_REPOSITORY, useClass: DrizzleFollowRepository },
    { provide: BLOCK_REPOSITORY, useClass: DrizzleBlockRepository },
    FollowUserUseCase,
    UnfollowUserUseCase,
    FindFollowersUseCase,
    FindFollowingUseCase,
    BlockUserUseCase,
    UnblockUserUseCase,
    FindBlockedUsersUseCase,
  ],
  exports: [FOLLOW_REPOSITORY, BLOCK_REPOSITORY],
})
export class SocialModule {}
