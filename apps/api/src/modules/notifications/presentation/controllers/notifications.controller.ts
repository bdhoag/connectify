import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CreateNotificationDto } from '../../application/dto/create-notification.dto';
import { QueryNotificationDto } from '../../application/dto/query-notification.dto';
import { UpdateNotificationPreferencesDto } from '../../application/dto/update-notification-preferences.dto';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';
import { FindNotificationByIdUseCase } from '../../application/use-cases/find-notification-by-id.use-case';
import { FindNotificationsUseCase } from '../../application/use-cases/find-notifications.use-case';
import { GetNotificationPreferencesUseCase } from '../../application/use-cases/get-notification-preferences.use-case';
import { MarkAllNotificationsReadUseCase } from '../../application/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.use-case';
import { UpdateNotificationPreferencesUseCase } from '../../application/use-cases/update-notification-preferences.use-case';

@Controller()
export class NotificationsController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly findNotificationsUseCase: FindNotificationsUseCase,
    private readonly findNotificationByIdUseCase: FindNotificationByIdUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
    private readonly getNotificationPreferencesUseCase: GetNotificationPreferencesUseCase,
    private readonly updateNotificationPreferencesUseCase: UpdateNotificationPreferencesUseCase,
  ) {}

  @Post('notifications')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.createNotificationUseCase.execute(user.id, dto);
  }

  @Get('notifications')
  findMany(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryNotificationDto,
  ) {
    return this.findNotificationsUseCase.execute(user.id, query);
  }

  @Get('notifications/:id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.findNotificationByIdUseCase.execute(user.id, id);
  }

  @Patch('notifications/:id/read')
  markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.markNotificationReadUseCase.execute(user.id, id);
  }

  @Post('users/:userId/notifications/read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.markAllNotificationsReadUseCase.execute(user.id, userId);
  }

  @Get('users/:userId/notification-preferences')
  getPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.getNotificationPreferencesUseCase.execute(user.id, userId);
  }

  @Patch('users/:userId/notification-preferences')
  updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.updateNotificationPreferencesUseCase.execute(
      user.id,
      userId,
      dto,
    );
  }
}
