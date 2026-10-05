import { NotificationEntity } from '../entities/notification.entity';

// A notification belongs to its recipient (`userId`), not to the actor who
// triggered it. Only the recipient may read it or mark it read.
export class NotificationPolicy {
  static canAccess(userId: string, notification: NotificationEntity): boolean {
    return notification.userId === userId;
  }
}
