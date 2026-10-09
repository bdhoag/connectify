import { Inject, Injectable } from '@nestjs/common';
import { MEDIA_STORAGE } from '../../domain/services/media-storage';
import type {
  MediaStorage,
  SignedUpload,
} from '../../domain/services/media-storage';
import { CreateUploadSignatureDto } from '../dto/create-upload-signature.dto';

@Injectable()
export class CreateUploadSignatureUseCase {
  constructor(@Inject(MEDIA_STORAGE) private readonly storage: MediaStorage) {}

  execute(userId: string, dto: CreateUploadSignatureDto): SignedUpload {
    return this.storage.signUpload(userId, dto.folder);
  }
}
