import { FollowEntity } from '../entities/follow.entity';

export const FOLLOW_REPOSITORY = Symbol('FOLLOW_REPOSITORY');

export interface CreateFollowData {
  followerId: string;
  followingId: string;
}

export interface FindFollowsParams {
  userId: string;
  page: number;
  limit: number;
}

export interface FindFollowsResult {
  items: FollowEntity[];
  total: number;
}

export interface FollowRepository {
  // Throws a domain-friendly conflict error on a duplicate (followerId, followingId) pair.
  create(data: CreateFollowData): Promise<FollowEntity>;
  findOne(followerId: string, followingId: string): Promise<FollowEntity | null>;
  delete(followerId: string, followingId: string): Promise<boolean>;
  findFollowers(params: FindFollowsParams): Promise<FindFollowsResult>;
  findFollowing(params: FindFollowsParams): Promise<FindFollowsResult>;
}
