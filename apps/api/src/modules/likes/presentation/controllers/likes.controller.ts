import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { LikePostDto } from '../../application/dto/like-post.dto';
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
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: LikePostDto,
  ) {
    return this.likePostUseCase.execute(postId, dto);
  }

  @Post('unlike')
  @HttpCode(HttpStatus.NO_CONTENT)
  unlike(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: LikePostDto,
  ) {
    return this.unlikePostUseCase.execute(postId, dto);
  }

  @Get('likes')
  findLikes(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findLikesByPostUseCase.execute(postId, query);
  }
}
