import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import {
  AttachMediaDto,
  MAX_MEDIA_PER_ITEM,
} from '../../../media/application/dto/attach-media.dto';

export class CreatePostDto {
  // Optional so a post can be images only; the use case requires at least
  // one of content or media.
  @ApiPropertyOptional({
    example: 'Just shipped a new feature! 🚀',
    minLength: 1,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  content?: string;

  @ApiPropertyOptional({ type: [AttachMediaDto], maxItems: MAX_MEDIA_PER_ITEM })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_MEDIA_PER_ITEM)
  @ValidateNested({ each: true })
  @Type(() => AttachMediaDto)
  media?: AttachMediaDto[];
}
