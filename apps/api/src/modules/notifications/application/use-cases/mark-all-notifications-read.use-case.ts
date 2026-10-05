import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UserPolicy } from '../../../users/domain/policies/user.policy';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(actorId: string, userId: string): Promise<void> {
    if (!UserPolicy.canManage(actorId, userId)) {
      throw new ForbiddenException(
        'You can only manage your own notifications',
      );
    }
    return this.notificationRepository.markAllRead(userId);
  }
}
