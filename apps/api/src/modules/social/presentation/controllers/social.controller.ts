import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { BlockUserUseCase } from '../../application/use-cases/block-user.use-case';
import { FindBlockedUsersUseCase } from '../../application/use-cases/find-blocked-users.use-case';
import { FindFollowersUseCase } from '../../application/use-cases/find-followers.use-case';
import { FindFollowingUseCase } from '../../application/use-cases/find-following.use-case';
import { FollowUserUseCase } from '../../application/use-cases/follow-user.use-case';
import { UnblockUserUseCase } from '../../application/use-cases/unblock-user.use-case';
import { UnfollowUserUseCase } from '../../application/use-cases/unfollow-user.use-case';

@Controller('users/:userId')
export class SocialController {
  constructor(
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase,
    private readonly findFollowersUseCase: FindFollowersUseCase,
    private readonly findFollowingUseCase: FindFollowingUseCase,
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly unblockUserUseCase: UnblockUserUseCase,
    private readonly findBlockedUsersUseCase: FindBlockedUsersUseCase,
  ) {}

  // `:userId` is the target of the action; the actor is always the caller.
  @Post('follow')
  follow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.followUserUseCase.execute(user.id, userId);
  }

  @Delete('follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  unfollow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.unfollowUserUseCase.execute(user.id, userId);
  }

  @Get('followers')
  findFollowers(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findFollowersUseCase.execute(userId, query);
  }

  @Get('following')
  findFollowing(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findFollowingUseCase.execute(userId, query);
  }

  @Post('block')
  block(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.blockUserUseCase.execute(user.id, userId);
  }

  @Delete('block')
  @HttpCode(HttpStatus.NO_CONTENT)
  unblock(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.unblockUserUseCase.execute(user.id, userId);
  }

  @Get('blocked')
  findBlocked(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findBlockedUsersUseCase.execute(user.id, userId, query);
  }
}
