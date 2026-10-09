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

export class SendMessageDto {
  // Optional so a message can be images only; the use case requires at least
  // one of content or media.
  @ApiPropertyOptional({
    example: 'Hey, how are you?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  content?: string;

  @ApiPropertyOptional({ type: [AttachMediaDto], maxItems: MAX_MEDIA_PER_ITEM })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_MEDIA_PER_ITEM)
  @ValidateNested({ each: true })
  @Type(() => AttachMediaDto)
  media?: AttachMediaDto[];
}
