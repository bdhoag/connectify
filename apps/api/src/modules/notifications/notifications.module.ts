import { Module } from '@nestjs/common';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { FindNotificationByIdUseCase } from './application/use-cases/find-notification-by-id.use-case';
import { FindNotificationsUseCase } from './application/use-cases/find-notifications.use-case';
import { GetNotificationPreferencesUseCase } from './application/use-cases/get-notification-preferences.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { UpdateNotificationPreferencesUseCase } from './application/use-cases/update-notification-preferences.use-case';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from './domain/repositories/notification-preferences.repository';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';
import { DrizzleNotificationPreferencesRepository } from './infrastructure/repositories/drizzle-notification-preferences.repository';
import { DrizzleNotificationRepository } from './infrastructure/repositories/drizzle-notification.repository';
import { NotificationsController } from './presentation/controllers/notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [
    { provide: NOTIFICATION_REPOSITORY, useClass: DrizzleNotificationRepository },
    {
      provide: NOTIFICATION_PREFERENCES_REPOSITORY,
      useClass: DrizzleNotificationPreferencesRepository,
    },
    CreateNotificationUseCase,
    FindNotificationsUseCase,
    FindNotificationByIdUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    GetNotificationPreferencesUseCase,
    UpdateNotificationPreferencesUseCase,
  ],
  exports: [NOTIFICATION_REPOSITORY, NOTIFICATION_PREFERENCES_REPOSITORY],
})
export class NotificationsModule {}
