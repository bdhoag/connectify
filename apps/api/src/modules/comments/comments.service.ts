import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';

// TODO: implement create comment/reply, delete-own (soft delete), and DTOs.
@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}
}
