import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { MEDIA_FOLDERS } from '../../domain/services/media-storage';
import type { MediaFolder } from '../../domain/services/media-storage';

export class CreateUploadSignatureDto {
  @ApiProperty({ enum: MEDIA_FOLDERS, example: 'posts' })
  @IsIn(MEDIA_FOLDERS)
  folder!: MediaFolder;
}
