import { Inject, Injectable } from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type { NotificationRepository } from '../../domain/repositories/notification.repository';
import { QueryNotificationDto } from '../dto/query-notification.dto';

const DEFAULT_LIMIT = 20;

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

@Injectable()
export class FindNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  execute(query: QueryNotificationDto): Promise<CursorPage<NotificationEntity>> {
    return this.notificationRepository.findForUser({
      userId: query.userId,
      unreadOnly: query.unreadOnly,
      cursor: query.cursor ? new Date(query.cursor) : undefined,
      limit: query.limit ?? DEFAULT_LIMIT,
    });
  }
}
