import { LikeEntity } from '../entities/like.entity';

export const LIKE_REPOSITORY = Symbol('LIKE_REPOSITORY');

export interface CreateLikeData {
  userId: string;
  postId: string;
}

export interface FindLikesByPostParams {
  postId: string;
  page: number;
  limit: number;
}

export interface FindLikesResult {
  items: LikeEntity[];
  total: number;
}

export interface LikeRepository {
  // Throws a domain-friendly conflict error if (userId, postId) already exists.
  create(data: CreateLikeData): Promise<LikeEntity>;
  findOne(userId: string, postId: string): Promise<LikeEntity | null>;
  findByPost(params: FindLikesByPostParams): Promise<FindLikesResult>;
  delete(userId: string, postId: string): Promise<boolean>;
}
