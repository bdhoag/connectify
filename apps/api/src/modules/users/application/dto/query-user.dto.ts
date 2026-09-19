import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { UserStatus } from '../../domain/entities/user.entity';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
