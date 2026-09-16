import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { notificationPreferences, notifications } from '../../database/schema';

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreferences =
  typeof notificationPreferences.$inferSelect;

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: NewNotification): Promise<Notification> {
    const [notification] = await this.db
      .insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  listForUser(userId: string, { unreadOnly = false } = {}) {
    return this.db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, userId),
        unreadOnly ? isNull(notifications.readAt) : undefined,
      ),
      orderBy: desc(notifications.createdAt),
      with: { actor: true },
    });
  }

  async markRead(id: string): Promise<Notification | undefined> {
    const [notification] = await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );
  }

  getPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    return this.db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });
  }

  async upsertPreferences(
    userId: string,
    data: Partial<
      Pick<
        NotificationPreferences,
        | 'likesEnabled'
        | 'commentsEnabled'
        | 'followsEnabled'
        | 'messagesEnabled'
      >
    >,
  ): Promise<NotificationPreferences> {
    const [preferences] = await this.db
      .insert(notificationPreferences)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return preferences;
  }
}
