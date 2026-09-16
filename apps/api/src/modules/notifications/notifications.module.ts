import { Module } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';

// No controller/service yet — notification creation/list/mark-read and
// preferences endpoints are TODO.
@Module({
  providers: [NotificationsRepository],
  exports: [NotificationsRepository],
})
export class NotificationsModule {}
