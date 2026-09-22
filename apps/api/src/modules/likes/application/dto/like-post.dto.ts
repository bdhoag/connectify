import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class LikePostDto {
  // TODO: derive from the authenticated request (@CurrentUser()) once JWT
  // auth lands; accepted in the body for now since there's no auth guard yet.
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  userId!: string;
}
