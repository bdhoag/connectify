import { pgEnum } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', [
  'ACTIVE',
  'SUSPENDED',
  'DELETED',
]);

export const mediaTypeEnum = pgEnum('media_type', ['IMAGE', 'VIDEO']);

export const notificationTypeEnum = pgEnum('notification_type', [
  'LIKE',
  'COMMENT',
  'FOLLOW',
  'MESSAGE',
]);

export const notificationEntityTypeEnum = pgEnum('notification_entity_type', [
  'POST',
  'COMMENT',
  'USER',
  'MESSAGE',
]);
