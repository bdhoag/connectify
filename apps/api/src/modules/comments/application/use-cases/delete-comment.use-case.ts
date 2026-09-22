import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  // TODO: enforce ownership (comment.authorId === currentUser.id, unless
  // MODERATOR/ADMIN) once auth guards/decorators exist.
  async execute(id: string): Promise<void> {
    const comment = await this.commentRepository.softDelete(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
  }
}
