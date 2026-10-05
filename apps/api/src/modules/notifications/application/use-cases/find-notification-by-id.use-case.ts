import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationPolicy } from '../../domain/policies/notification.policy';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class FindNotificationByIdUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string, id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    if (!NotificationPolicy.canAccess(userId, notification)) {
      throw new ForbiddenException(
        'You are not allowed to view this notification',
      );
    }
    return notification;
  }
}
