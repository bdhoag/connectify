import { Inject, Injectable } from '@nestjs/common';
import { NotificationPreferencesEntity } from '../../domain/entities/notification-preferences.entity';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/repositories/notification-preferences.repository';
import type { NotificationPreferencesRepository } from '../../domain/repositories/notification-preferences.repository';

const DEFAULTS = {
  likesEnabled: true,
  commentsEnabled: true,
  followsEnabled: true,
  messagesEnabled: true,
};

@Injectable()
export class GetNotificationPreferencesUseCase {
  constructor(
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: NotificationPreferencesRepository,
  ) {}

  async execute(userId: string): Promise<NotificationPreferencesEntity> {
    const existing = await this.preferencesRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    // No row yet — create one with defaults on first access rather than
    // erroring, since every user implicitly has default preferences.
    return this.preferencesRepository.upsert(userId, DEFAULTS);
  }
}
