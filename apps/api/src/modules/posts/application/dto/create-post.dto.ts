import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Just shipped a new feature! 🚀',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @Length(1, 5000)
  content!: string;
}
