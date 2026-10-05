import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsUUID } from 'class-validator';

export class CreateConversationDto {
  // The authenticated user is always a member and is added automatically, so
  // this lists only the other participants.
  @ApiProperty({
    example: ['9c858901-8a57-4791-81fe-4c455b099bc9'],
    minItems: 1,
    description: 'Other participants; the current user is added automatically',
  })
  @ArrayMinSize(1, {
    message: 'A conversation needs at least 1 other member',
  })
  @ArrayUnique()
  @IsUUID('4', { each: true })
  memberIds!: string[];
}
