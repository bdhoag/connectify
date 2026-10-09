import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, Length } from 'class-validator';

// Max files attachable to a single post or message.
export const MAX_MEDIA_PER_ITEM = 10;

export class AttachMediaDto {
  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1/connectify/posts/user-id/abc.jpg',
  })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Length(1, 2048)
  url!: string;

  @ApiProperty({ example: 'connectify/posts/user-id/abc' })
  @IsString()
  @Length(1, 255)
  publicId!: string;
}
