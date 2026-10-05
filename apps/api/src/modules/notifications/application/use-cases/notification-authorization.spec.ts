import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  NotificationEntity,
  NotificationEntityType,
  NotificationType,
} from '../../domain/entities/notification.entity';
import { CreateNotificationUseCase } from './create-notification.use-case';
import { FindNotificationByIdUseCase } from './find-notification-by-id.use-case';
import { FindNotificationsUseCase } from './find-notifications.use-case';
import { GetNotificationPreferencesUseCase } from './get-notification-preferences.use-case';
import { MarkAllNotificationsReadUseCase } from './mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from './mark-notification-read.use-case';
import { UpdateNotificationPreferencesUseCase } from './update-notification-preferences.use-case';

const RECIPIENT = 'recipient';
const OTHER = 'other';

const notification = new NotificationEntity({
  id: 'n-1',
  userId: RECIPIENT,
  actorId: 'actor',
  type: NotificationType.LIKE,
  entityType: NotificationEntityType.POST,
  entityId: 'post-1',
  readAt: null,
  createdAt: new Date(),
});

const makeRepo = (found: NotificationEntity | null = notification) => ({
  create: jest.fn().mockResolvedValue(notification),
  findById: jest.fn().mockResolvedValue(found),
  findForUser: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
  markRead: jest.fn().mockResolvedValue(notification),
  markAllRead: jest.fn().mockResolvedValue(undefined),
});

const makePrefsRepo = () => ({
  findByUserId: jest.fn().mockResolvedValue({ userId: RECIPIENT }),
  upsert: jest.fn().mockResolvedValue({ userId: RECIPIENT }),
});

describe('notification authorization', () => {
  it('only lets the recipient read a notification', async () => {
    const repo = makeRepo();
    const useCase = new FindNotificationByIdUseCase(repo);
    await expect(useCase.execute(RECIPIENT, 'n-1')).resolves.toBe(notification);
    await expect(useCase.execute(OTHER, 'n-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns 404 for a missing notification', async () => {
    const useCase = new FindNotificationByIdUseCase(makeRepo(null));
    await expect(useCase.execute(RECIPIENT, 'n-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('only lets the recipient mark a notification read', async () => {
    const repo = makeRepo();
    const useCase = new MarkNotificationReadUseCase(repo);
    await expect(useCase.execute(OTHER, 'n-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.markRead).not.toHaveBeenCalled();

    await useCase.execute(RECIPIENT, 'n-1');
    expect(repo.markRead).toHaveBeenCalledWith('n-1');
  });

  it("always lists the caller's own notifications", async () => {
    const repo = makeRepo();
    await new FindNotificationsUseCase(repo).execute(RECIPIENT, {});
    expect(repo.findForUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: RECIPIENT }),
    );
  });

  it('sets the actor from the authenticated user, not the body', async () => {
    const repo = makeRepo();
    await new CreateNotificationUseCase(repo).execute(OTHER, {
      userId: RECIPIENT,
      type: NotificationType.LIKE,
      entityType: NotificationEntityType.POST,
      entityId: 'post-1',
    });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: RECIPIENT, actorId: OTHER }),
    );
  });

  it("forbids acting on another user's read-all", async () => {
    const repo = makeRepo();
    const useCase = new MarkAllNotificationsReadUseCase(repo);
    await expect(useCase.execute(OTHER, RECIPIENT)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.markAllRead).not.toHaveBeenCalled();
    await useCase.execute(RECIPIENT, RECIPIENT);
    expect(repo.markAllRead).toHaveBeenCalledWith(RECIPIENT);
  });

  it("forbids reading or changing another user's preferences", async () => {
    const prefs = makePrefsRepo();
    const get = new GetNotificationPreferencesUseCase(prefs);
    const update = new UpdateNotificationPreferencesUseCase(prefs);

    await expect(get.execute(OTHER, RECIPIENT)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      update.execute(OTHER, RECIPIENT, { likesEnabled: false }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prefs.upsert).not.toHaveBeenCalled();

    await get.execute(RECIPIENT, RECIPIENT);
    await update.execute(RECIPIENT, RECIPIENT, { likesEnabled: false });
    expect(prefs.upsert).toHaveBeenCalledWith(RECIPIENT, {
      likesEnabled: false,
    });
  });
});
