import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  // TODO: enforce that only the recipient (notification.userId ===
  // currentUser.id) may mark it read, once auth guards/decorators exist.
  async execute(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.markRead(id);
    if (!notification) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    return notification;
  }
}
