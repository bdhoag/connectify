import { CommentEntity } from '../entities/comment.entity';

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY');

export interface CreateCommentData {
  postId: string;
  authorId: string;
  parentId?: string | null;
  content: string;
}

export interface UpdateCommentData {
  content?: string;
}

export interface FindTopLevelCommentsParams {
  page: number;
  limit: number;
  postId: string;
}

export interface FindRepliesParams {
  page: number;
  limit: number;
  parentId: string;
}

export interface FindCommentsResult {
  items: CommentEntity[];
  total: number;
}

export interface CommentRepository {
  create(data: CreateCommentData): Promise<CommentEntity>;
  findById(id: string): Promise<CommentEntity | null>;
  findTopLevelByPost(
    params: FindTopLevelCommentsParams,
  ): Promise<FindCommentsResult>;
  findReplies(params: FindRepliesParams): Promise<FindCommentsResult>;
  update(id: string, data: UpdateCommentData): Promise<CommentEntity | null>;
  softDelete(id: string): Promise<CommentEntity | null>;
}
