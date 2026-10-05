import { CommentEntity } from '../entities/comment.entity';

// Who may do what to a comment. Creating and reading are open to any
// authenticated user (subject to the target post/comment existing).
export class CommentPolicy {
  static canUpdate(userId: string, comment: CommentEntity): boolean {
    return comment.authorId === userId;
  }

  static canDelete(userId: string, comment: CommentEntity): boolean {
    return comment.authorId === userId;
  }
}
