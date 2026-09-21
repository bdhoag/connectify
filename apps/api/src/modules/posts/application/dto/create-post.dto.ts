import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreatePostDto {
  // TODO: derive from the authenticated request (@CurrentUser()) once JWT
  // auth lands; accepted in the body for now since there's no auth guard yet.
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  authorId!: string;

  @ApiProperty({
    example: 'Just shipped a new feature! 🚀',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @Length(1, 5000)
  content!: string;
}
