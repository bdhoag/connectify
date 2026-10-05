import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { CommentPolicy } from '../../domain/policies/comment.policy';
import { COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    dto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    if (!CommentPolicy.canUpdate(userId, comment)) {
      throw new ForbiddenException(
        'You are not allowed to update this comment',
      );
    }

    const updated = await this.commentRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    return updated;
  }
}
