import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
