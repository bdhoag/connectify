import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentPolicy } from '../../domain/policies/comment.policy';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    if (!CommentPolicy.canDelete(userId, comment)) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    const deleted = await this.commentRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
  }
}
