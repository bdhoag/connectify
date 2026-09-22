import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class FindNotificationByIdUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    return notification;
  }
}
