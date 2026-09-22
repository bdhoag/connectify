import { Module } from '@nestjs/common';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { FindPostByIdUseCase } from './application/use-cases/find-post-by-id.use-case';
import { FindPostsUseCase } from './application/use-cases/find-posts.use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { POST_REPOSITORY } from './domain/repositories/post.repository';
import { DrizzlePostRepository } from './infrastructure/repositories/drizzle-post.repository';
import { PostsController } from './presentation/controllers/posts.controller';

@Module({
  controllers: [PostsController],
  providers: [
    { provide: POST_REPOSITORY, useClass: DrizzlePostRepository },
    CreatePostUseCase,
    FindPostByIdUseCase,
    FindPostsUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
  ],
  exports: [POST_REPOSITORY],
})
export class PostsModule {}
