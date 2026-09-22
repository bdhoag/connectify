import {
  NotificationEntityType,
  NotificationEntity,
  NotificationType,
} from '../entities/notification.entity';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface CreateNotificationData {
  userId: string;
  actorId: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
}

export interface FindNotificationsParams {
  userId: string;
  unreadOnly?: boolean;
  cursor?: Date;
  limit: number;
}

export interface FindNotificationsResult {
  items: NotificationEntity[];
  nextCursor: string | null;
}

export interface NotificationRepository {
  create(data: CreateNotificationData): Promise<NotificationEntity>;
  findById(id: string): Promise<NotificationEntity | null>;
  findForUser(
    params: FindNotificationsParams,
  ): Promise<FindNotificationsResult>;
  markRead(id: string): Promise<NotificationEntity | null>;
  markAllRead(userId: string): Promise<void>;
}
