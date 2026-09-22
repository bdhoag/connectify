import { UserEntity, UserStatus } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface FindUsersParams {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus;
}

export interface FindUsersResult {
  items: UserEntity[];
  total: number;
}

export interface UserRepository {
  create(data: CreateUserData): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findMany(params: FindUsersParams): Promise<FindUsersResult>;
  update(id: string, data: UpdateUserData): Promise<UserEntity | null>;
  softDelete(id: string): Promise<UserEntity | null>;
}
