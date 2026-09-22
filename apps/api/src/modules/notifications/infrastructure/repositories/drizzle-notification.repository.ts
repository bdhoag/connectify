import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { notifications } from '../../../../database/schema';
import {
  NotificationEntity,
  NotificationEntityType,
  NotificationType,
} from '../../domain/entities/notification.entity';
import {
  CreateNotificationData,
  FindNotificationsParams,
  FindNotificationsResult,
  NotificationRepository,
} from '../../domain/repositories/notification.repository';

type NotificationRow = typeof notifications.$inferSelect;

@Injectable()
export class DrizzleNotificationRepository implements NotificationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreateNotificationData): Promise<NotificationEntity> {
    const [row] = await this.db.insert(notifications).values(data).returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const row = await this.db.query.notifications.findFirst({
      where: eq(notifications.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  // Newest-first, cursor = createdAt of the oldest item already seen by the client.
  async findForUser(
    params: FindNotificationsParams,
  ): Promise<FindNotificationsResult> {
    const where = and(
      eq(notifications.userId, params.userId),
      params.unreadOnly ? isNull(notifications.readAt) : undefined,
      params.cursor ? lt(notifications.createdAt, params.cursor) : undefined,
    );

    const rows = await this.db.query.notifications.findMany({
      where,
      limit: params.limit,
      orderBy: desc(notifications.createdAt),
    });

    const items = rows.map((row) => this.toEntity(row));
    const nextCursor =
      items.length === params.limit
        ? items[items.length - 1].createdAt.toISOString()
        : null;

    return { items, nextCursor };
  }

  async markRead(id: string): Promise<NotificationEntity | null> {
    const [row] = await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  }

  private toEntity(row: NotificationRow): NotificationEntity {
    return new NotificationEntity({
      id: row.id,
      userId: row.userId,
      actorId: row.actorId,
      type: row.type as NotificationType,
      entityType: row.entityType as NotificationEntityType,
      entityId: row.entityId,
      readAt: row.readAt,
      createdAt: row.createdAt,
    });
  }
}
