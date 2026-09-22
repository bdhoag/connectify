import { Inject, Injectable } from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type { NotificationRepository } from '../../domain/repositories/notification.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  execute(dto: CreateNotificationDto): Promise<NotificationEntity> {
    return this.notificationRepository.create(dto);
  }
}
