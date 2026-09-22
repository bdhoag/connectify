import {
  Body,
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
import { BlockUserDto } from '../../application/dto/block-user.dto';
import { FollowUserDto } from '../../application/dto/follow-user.dto';
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

  @Post('follow')
  follow(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: FollowUserDto,
  ) {
    return this.followUserUseCase.execute(userId, dto);
  }

  @Delete('follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  unfollow(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: FollowUserDto,
  ) {
    return this.unfollowUserUseCase.execute(userId, dto);
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
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: BlockUserDto,
  ) {
    return this.blockUserUseCase.execute(userId, dto);
  }

  @Delete('block')
  @HttpCode(HttpStatus.NO_CONTENT)
  unblock(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: BlockUserDto,
  ) {
    return this.unblockUserUseCase.execute(userId, dto);
  }

  @Get('blocked')
  findBlocked(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findBlockedUsersUseCase.execute(userId, query);
  }
}
