import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'jane_doe',
    minLength: 3,
    maxLength: 30,
    description: 'Letters, numbers, and underscores only',
  })
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username may only contain letters, numbers, and underscores',
  })
  username!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Jane Doe', minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  displayName!: string;

  @ApiPropertyOptional({
    example: 'Full-stack developer and coffee enthusiast.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatars/jane.png' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
