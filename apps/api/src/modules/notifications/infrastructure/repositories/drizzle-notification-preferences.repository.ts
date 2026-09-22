import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { notificationPreferences } from '../../../../database/schema';
import { NotificationPreferencesEntity } from '../../domain/entities/notification-preferences.entity';
import {
  NotificationPreferencesRepository,
  UpdateNotificationPreferencesData,
} from '../../domain/repositories/notification-preferences.repository';

type PreferencesRow = typeof notificationPreferences.$inferSelect;

@Injectable()
export class DrizzleNotificationPreferencesRepository
  implements NotificationPreferencesRepository
{
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findByUserId(
    userId: string,
  ): Promise<NotificationPreferencesEntity | null> {
    const row = await this.db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });
    return row ? this.toEntity(row) : null;
  }

  async upsert(
    userId: string,
    data: UpdateNotificationPreferencesData,
  ): Promise<NotificationPreferencesEntity> {
    const [row] = await this.db
      .insert(notificationPreferences)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return this.toEntity(row);
  }

  private toEntity(row: PreferencesRow): NotificationPreferencesEntity {
    return new NotificationPreferencesEntity({
      userId: row.userId,
      likesEnabled: row.likesEnabled,
      commentsEnabled: row.commentsEnabled,
      followsEnabled: row.followsEnabled,
      messagesEnabled: row.messagesEnabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
