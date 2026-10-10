import { NewMediaAttachment } from '../entities/media-attachment.entity';

export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE');

// Where an upload belongs; each maps to its own provider folder.
export const MEDIA_FOLDERS = ['posts', 'messages'] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

// Everything the client needs to upload one file straight to the provider.
export interface SignedUpload {
  uploadUrl: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  publicId: string;
  allowedFormats: string;
}

export interface MediaStorage {
  signUpload(userId: string, folder: MediaFolder): SignedUpload;
  // True only if the asset lives in our account, under this user's folder.
  isOwnedUpload(
    userId: string,
    folder: MediaFolder,
    asset: NewMediaAttachment,
  ): boolean;
  // Permanently removes the files; ids that no longer exist are not an error.
  deleteMany(publicIds: string[]): Promise<void>;
}
