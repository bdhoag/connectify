import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { CreateReplyUseCase } from './application/use-cases/create-reply.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { FindCommentByIdUseCase } from './application/use-cases/find-comment-by-id.use-case';
import { FindCommentsUseCase } from './application/use-cases/find-comments.use-case';
import { FindRepliesUseCase } from './application/use-cases/find-replies.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository';
import { DrizzleCommentRepository } from './infrastructure/repositories/drizzle-comment.repository';
import { CommentsController } from './presentation/controllers/comments.controller';

@Module({
  imports: [PostsModule],
  controllers: [CommentsController],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: DrizzleCommentRepository },
    CreateCommentUseCase,
    CreateReplyUseCase,
    FindCommentByIdUseCase,
    FindCommentsUseCase,
    FindRepliesUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
  ],
  exports: [COMMENT_REPOSITORY],
})
export class CommentsModule {}
