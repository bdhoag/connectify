import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { NewMediaAttachment } from '../../domain/entities/media-attachment.entity';
import {
  MediaFolder,
  MediaStorage,
  SignedUpload,
} from '../../domain/services/media-storage';

const ROOT_FOLDER = 'connectify';
// Images only for now; Cloudinary rejects anything else at upload time.
const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,gif';
// Cloudinary's delete_resources accepts at most 100 ids per call.
const DELETE_BATCH_SIZE = 100;

@Injectable()
export class CloudinaryMediaStorage implements MediaStorage {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(config: ConfigService) {
    this.cloudName = config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME');
    this.apiKey = config.getOrThrow<string>('CLOUDINARY_API_KEY');
    this.apiSecret = config.getOrThrow<string>('CLOUDINARY_API_SECRET');

    // Needed by the Admin API (deleting); signing passes the secret itself.
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
  }

  signUpload(userId: string, folder: MediaFolder): SignedUpload {
    const timestamp = Math.round(Date.now() / 1000);
    // We pick the public_id (it embeds the owner), so the client cannot
    // choose where its file lands. Works with both fixed and dynamic folder
    // modes, unlike the `folder` param which dynamic mode treats as a label.
    const publicId = `${this.folderFor(userId, folder)}/${randomUUID()}`;

    // Every signed param must be sent unchanged by the client, so it cannot
    // upload elsewhere or with different formats than we allowed.
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        public_id: publicId,
        allowed_formats: ALLOWED_FORMATS,
      },
      this.apiSecret,
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      apiKey: this.apiKey,
      signature,
      timestamp,
      publicId,
      allowedFormats: ALLOWED_FORMATS,
    };
  }

  isOwnedUpload(
    userId: string,
    folder: MediaFolder,
    asset: NewMediaAttachment,
  ): boolean {
    const expectedFolder = `${this.folderFor(userId, folder)}/`;
    if (!asset.publicId.startsWith(expectedFolder)) return false;

    let url: URL;
    try {
      url = new URL(asset.url);
    } catch {
      return false;
    }

    // …/image/upload/v123/<publicId>.<ext>
    const prefix = `/${this.cloudName}/image/upload/`;
    return (
      url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.startsWith(prefix) &&
      url.pathname.includes(`/${asset.publicId}.`)
    );
  }

  async deleteMany(publicIds: string[]): Promise<void> {
    for (let i = 0; i < publicIds.length; i += DELETE_BATCH_SIZE) {
      // invalidate: also purge the CDN copy, otherwise the URL keeps working.
      await cloudinary.api.delete_resources(
        publicIds.slice(i, i + DELETE_BATCH_SIZE),
        { resource_type: 'image', type: 'upload', invalidate: true },
      );
    }
  }

  private folderFor(userId: string, folder: MediaFolder): string {
    return `${ROOT_FOLDER}/${folder}/${userId}`;
  }
}
