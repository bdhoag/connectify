import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NewMediaAttachment } from '../../domain/entities/media-attachment.entity';
import { MEDIA_STORAGE } from '../../domain/services/media-storage';
import type {
  MediaFolder,
  MediaStorage,
} from '../../domain/services/media-storage';

// The client tells us which files to attach, so never trust the URL: it must
// point at an asset this user uploaded through a signature we issued.
@Injectable()
export class MediaAttachmentValidator {
  constructor(@Inject(MEDIA_STORAGE) private readonly storage: MediaStorage) {}

  assertOwned(
    userId: string,
    folder: MediaFolder,
    items: NewMediaAttachment[] = [],
  ): void {
    const invalid = items.find(
      (item) => !this.storage.isOwnedUpload(userId, folder, item),
    );
    if (invalid) {
      throw new BadRequestException(
        `Media "${invalid.publicId}" was not uploaded by you for ${folder}`,
      );
    }
  }
}
