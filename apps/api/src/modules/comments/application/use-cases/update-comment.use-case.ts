import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  // TODO: enforce ownership (comment.authorId === currentUser.id, unless
  // MODERATOR/ADMIN) once auth guards/decorators exist.
  async execute(id: string, dto: UpdateCommentDto): Promise<CommentEntity> {
    const comment = await this.commentRepository.update(id, dto);
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    return comment;
  }
}
