import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UserPolicy } from '../../../users/domain/policies/user.policy';
import { NotificationPreferencesEntity } from '../../domain/entities/notification-preferences.entity';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/repositories/notification-preferences.repository';
import type { NotificationPreferencesRepository } from '../../domain/repositories/notification-preferences.repository';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';

@Injectable()
export class UpdateNotificationPreferencesUseCase {
  constructor(
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: NotificationPreferencesRepository,
  ) {}

  async execute(
    actorId: string,
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesEntity> {
    if (!UserPolicy.canManage(actorId, userId)) {
      throw new ForbiddenException(
        'You can only update your own notification preferences',
      );
    }

    return this.preferencesRepository.upsert(userId, dto);
  }
}
