import { PostEntity } from '../entities/post.entity';

// Who may do what to a post. Posts have no visibility setting yet, so reading
// is open to any authenticated user and needs no rule here.
export class PostPolicy {
  static canUpdate(userId: string, post: PostEntity): boolean {
    return post.authorId === userId;
  }

  static canDelete(userId: string, post: PostEntity): boolean {
    return post.authorId === userId;
  }
}
