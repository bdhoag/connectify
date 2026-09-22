import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { FindLikesByPostUseCase } from './application/use-cases/find-likes-by-post.use-case';
import { LikePostUseCase } from './application/use-cases/like-post.use-case';
import { UnlikePostUseCase } from './application/use-cases/unlike-post.use-case';
import { LIKE_REPOSITORY } from './domain/repositories/like.repository';
import { DrizzleLikeRepository } from './infrastructure/repositories/drizzle-like.repository';
import { LikesController } from './presentation/controllers/likes.controller';

@Module({
  imports: [PostsModule],
  controllers: [LikesController],
  providers: [
    { provide: LIKE_REPOSITORY, useClass: DrizzleLikeRepository },
    LikePostUseCase,
    UnlikePostUseCase,
    FindLikesByPostUseCase,
  ],
  exports: [LIKE_REPOSITORY],
})
export class LikesModule {}
