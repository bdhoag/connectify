import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import {
  NotificationEntityType,
  NotificationType,
} from '../../domain/entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: '9c858901-8a57-4791-81fe-4c455b099bc9' })
  @IsUUID()
  actorId!: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.LIKE })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    enum: NotificationEntityType,
    example: NotificationEntityType.POST,
  })
  @IsEnum(NotificationEntityType)
  entityType!: NotificationEntityType;

  // Polymorphic reference — the id of the post/comment/user/message this
  // notification is about, depending on entityType. Intentionally not an FK.
  @ApiProperty({ example: '2f6b1a0e-4f1a-4c9b-9c0a-1f2e3d4c5b6a' })
  @IsUUID()
  entityId!: string;
}
