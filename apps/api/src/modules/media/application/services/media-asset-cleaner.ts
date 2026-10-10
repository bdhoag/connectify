import { Inject, Injectable, Logger } from '@nestjs/common';
import { MEDIA_STORAGE } from '../../domain/services/media-storage';
import type { MediaStorage } from '../../domain/services/media-storage';

// Removes files from the media provider after their post/message is gone.
// The database is the source of truth: if the provider call fails we log it
// and carry on, so a Cloudinary outage never blocks a user from deleting
// their own content. The leftover files are orphans for a cleanup job.
@Injectable()
export class MediaAssetCleaner {
  private readonly logger = new Logger(MediaAssetCleaner.name);

  constructor(@Inject(MEDIA_STORAGE) private readonly storage: MediaStorage) {}

  async deleteAssets(media: { publicId: string }[]): Promise<void> {
    if (media.length === 0) return;

    const publicIds = media.map((item) => item.publicId);
    try {
      await this.storage.deleteMany(publicIds);
    } catch (error) {
      this.logger.error(
        `Failed to delete ${publicIds.length} media asset(s): ${publicIds.join(', ')}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
