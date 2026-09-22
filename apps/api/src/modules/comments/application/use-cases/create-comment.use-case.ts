import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { POST_REPOSITORY } from '../../../posts/domain/repositories/post.repository';
import type { PostRepository } from '../../../posts/domain/repositories/post.repository';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  async execute(postId: string, dto: CreateCommentDto): Promise<CommentEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with id "${postId}" not found`);
    }

    return this.commentRepository.create({
      postId,
      authorId: dto.authorId,
      content: dto.content,
    });
  }
}
