import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoleName } from '../../domain/entities/role.entity';

export class AssignRoleDto {
  @ApiProperty({ enum: RoleName, example: RoleName.MODERATOR })
  @IsEnum(RoleName)
  roleName!: RoleName;
}
