import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity';

export const NOTIFICATION_PREFERENCES_REPOSITORY = Symbol(
  'NOTIFICATION_PREFERENCES_REPOSITORY',
);

export interface UpdateNotificationPreferencesData {
  likesEnabled?: boolean;
  commentsEnabled?: boolean;
  followsEnabled?: boolean;
  messagesEnabled?: boolean;
}

export interface NotificationPreferencesRepository {
  findByUserId(userId: string): Promise<NotificationPreferencesEntity | null>;
  // Creates the row with defaults on first access, otherwise merges the update.
  upsert(
    userId: string,
    data: UpdateNotificationPreferencesData,
  ): Promise<NotificationPreferencesEntity>;
}
