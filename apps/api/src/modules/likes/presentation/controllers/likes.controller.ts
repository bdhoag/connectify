import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { FindLikesByPostUseCase } from '../../application/use-cases/find-likes-by-post.use-case';
import { LikePostUseCase } from '../../application/use-cases/like-post.use-case';
import { UnlikePostUseCase } from '../../application/use-cases/unlike-post.use-case';

@Controller('posts/:postId')
export class LikesController {
  constructor(
    private readonly likePostUseCase: LikePostUseCase,
    private readonly unlikePostUseCase: UnlikePostUseCase,
    private readonly findLikesByPostUseCase: FindLikesByPostUseCase,
  ) {}

  @Post('like')
  like(
    @CurrentUser() user: AuthenticatedUser,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.likePostUseCase.execute(user.id, postId);
  }

  @Post('unlike')
  @HttpCode(HttpStatus.NO_CONTENT)
  unlike(
    @CurrentUser() user: AuthenticatedUser,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.unlikePostUseCase.execute(user.id, postId);
  }

  @Get('likes')
  findLikes(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findLikesByPostUseCase.execute(postId, query);
  }
}
