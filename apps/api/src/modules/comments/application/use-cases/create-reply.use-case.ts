import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CreateReplyUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(
    parentId: string,
    dto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const parent = await this.commentRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Comment with id "${parentId}" not found`);
    }

    return this.commentRepository.create({
      postId: parent.postId,
      parentId: parent.id,
      authorId: dto.authorId,
      content: dto.content,
    });
  }
}
