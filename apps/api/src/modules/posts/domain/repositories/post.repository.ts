import { PostEntity } from '../entities/post.entity';

export const POST_REPOSITORY = Symbol('POST_REPOSITORY');

export interface CreatePostData {
  authorId: string;
  content: string;
}

export interface UpdatePostData {
  content?: string;
}

export interface FindPostsParams {
  page: number;
  limit: number;
  authorId?: string;
}

export interface FindPostsResult {
  items: PostEntity[];
  total: number;
}

export interface PostRepository {
  create(data: CreatePostData): Promise<PostEntity>;
  findById(id: string): Promise<PostEntity | null>;
  findMany(params: FindPostsParams): Promise<FindPostsResult>;
  update(id: string, data: UpdatePostData): Promise<PostEntity | null>;
  softDelete(id: string): Promise<PostEntity | null>;
}
