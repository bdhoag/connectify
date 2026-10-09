import { Module } from '@nestjs/common';
import { MediaAssetCleaner } from './application/services/media-asset-cleaner';
import { MediaAttachmentValidator } from './application/services/media-attachment-validator';
import { CreateUploadSignatureUseCase } from './application/use-cases/create-upload-signature.use-case';
import { MEDIA_STORAGE } from './domain/services/media-storage';
import { CloudinaryMediaStorage } from './infrastructure/services/cloudinary-media-storage';
import { MediaController } from './presentation/controllers/media.controller';

@Module({
  controllers: [MediaController],
  providers: [
    { provide: MEDIA_STORAGE, useClass: CloudinaryMediaStorage },
    CreateUploadSignatureUseCase,
    MediaAttachmentValidator,
    MediaAssetCleaner,
  ],
  exports: [MediaAttachmentValidator, MediaAssetCleaner],
})
export class MediaModule {}
