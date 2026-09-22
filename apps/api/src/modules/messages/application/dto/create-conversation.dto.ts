import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsUUID } from 'class-validator';

export class CreateConversationDto {
  // TODO: derive the creator from the authenticated request once JWT auth
  // lands, and add them automatically; all members are accepted in the body
  // for now since there's no auth guard yet.
  @ApiProperty({
    example: [
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      '9c858901-8a57-4791-81fe-4c455b099bc9',
    ],
    minItems: 2,
  })
  @ArrayMinSize(2, { message: 'A conversation needs at least 2 members' })
  @ArrayUnique()
  @IsUUID('4', { each: true })
  memberIds!: string[];
}
