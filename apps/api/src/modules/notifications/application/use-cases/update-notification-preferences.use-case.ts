import { Inject, Injectable } from '@nestjs/common';
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

  execute(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesEntity> {
    return this.preferencesRepository.upsert(userId, dto);
  }
}
