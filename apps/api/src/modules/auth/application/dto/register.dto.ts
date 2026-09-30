import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
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

  @ApiProperty({
    example: 'Str0ngPassword!',
    minLength: 8,
    maxLength: 100,
    description: 'At least 8 characters, including a letter and a number',
  })
  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password!: string;
}
