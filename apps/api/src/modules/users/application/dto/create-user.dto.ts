import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username may only contain letters, numbers, and underscores',
  })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 100)
  displayName: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
