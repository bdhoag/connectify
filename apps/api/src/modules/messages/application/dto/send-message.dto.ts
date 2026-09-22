import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class SendMessageDto {
  // TODO: derive from the authenticated request (@CurrentUser()) once JWT
  // auth lands; accepted in the body for now since there's no auth guard yet.
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  senderId!: string;

  @ApiProperty({ example: 'Hey, how are you?', minLength: 1, maxLength: 2000 })
  @IsString()
  @Length(1, 2000)
  content!: string;
}
