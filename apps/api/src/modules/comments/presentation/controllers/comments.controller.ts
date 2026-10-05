import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { CreateCommentDto } from '../../application/dto/create-comment.dto';
import { UpdateCommentDto } from '../../application/dto/update-comment.dto';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { CreateReplyUseCase } from '../../application/use-cases/create-reply.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { FindCommentByIdUseCase } from '../../application/use-cases/find-comment-by-id.use-case';
import { FindCommentsUseCase } from '../../application/use-cases/find-comments.use-case';
import { FindRepliesUseCase } from '../../application/use-cases/find-replies.use-case';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';

// Comments are addressed two ways: nested under their post for creation/listing
// (`posts/:postId/comments`), and flat by their own id for everything else
// (`comments/:id`) — hence one controller with explicit per-route paths
// rather than a single resource prefix.
@Controller()
export class CommentsController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly createReplyUseCase: CreateReplyUseCase,
    private readonly findCommentByIdUseCase: FindCommentByIdUseCase,
    private readonly findCommentsUseCase: FindCommentsUseCase,
    private readonly findRepliesUseCase: FindRepliesUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Post('posts/:postId/comments')
  createTopLevel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.createCommentUseCase.execute(user.id, postId, dto);
  }

  @Get('posts/:postId/comments')
  findTopLevel(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findCommentsUseCase.execute(postId, query);
  }

  @Get('comments/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findCommentByIdUseCase.execute(id);
  }

  @Post('comments/:id/replies')
  createReply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.createReplyUseCase.execute(user.id, id, dto);
  }

  @Get('comments/:id/replies')
  findReplies(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findRepliesUseCase.execute(id, query);
  }

  @Patch('comments/:id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.updateCommentUseCase.execute(user.id, id, dto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteCommentUseCase.execute(user.id, id);
  }
}
