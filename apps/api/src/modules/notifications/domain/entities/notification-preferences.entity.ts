export class NotificationPreferencesEntity {
  userId: string;
  likesEnabled: boolean;
  commentsEnabled: boolean;
  followsEnabled: boolean;
  messagesEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    userId: string;
    likesEnabled: boolean;
    commentsEnabled: boolean;
    followsEnabled: boolean;
    messagesEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.userId = props.userId;
    this.likesEnabled = props.likesEnabled;
    this.commentsEnabled = props.commentsEnabled;
    this.followsEnabled = props.followsEnabled;
    this.messagesEnabled = props.messagesEnabled;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
