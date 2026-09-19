export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export class UserEntity {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    username: string;
    email: string;
    status: UserStatus;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.status = props.status;
    this.displayName = props.displayName;
    this.bio = props.bio;
    this.avatarUrl = props.avatarUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
