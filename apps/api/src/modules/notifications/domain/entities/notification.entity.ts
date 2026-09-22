export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MESSAGE = 'MESSAGE',
}

export enum NotificationEntityType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  USER = 'USER',
  MESSAGE = 'MESSAGE',
}

export class NotificationEntity {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  readAt: Date | null;
  createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    actorId: string;
    type: NotificationType;
    entityType: NotificationEntityType;
    entityId: string;
    readAt: Date | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.actorId = props.actorId;
    this.type = props.type;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.readAt = props.readAt;
    this.createdAt = props.createdAt;
  }
}
