import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { AssignRoleDto } from '../../application/dto/assign-role.dto';
import { AssignRoleUseCase } from '../../application/use-cases/assign-role.use-case';
import { FindAllRolesUseCase } from '../../application/use-cases/find-all-roles.use-case';
import { FindUserRolesUseCase } from '../../application/use-cases/find-user-roles.use-case';
import { RemoveRoleUseCase } from '../../application/use-cases/remove-role.use-case';

// Roles themselves are fixed seed data (USER/MODERATOR/ADMIN) — there is no
// create/update/delete for the `roles` resource. What's mutable is the
// user<->role assignment, so that's what gets CRUD-style endpoints here.
@Controller()
export class RolesController {
  constructor(
    private readonly findAllRolesUseCase: FindAllRolesUseCase,
    private readonly findUserRolesUseCase: FindUserRolesUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly removeRoleUseCase: RemoveRoleUseCase,
  ) {}

  @Get('roles')
  findAll() {
    return this.findAllRolesUseCase.execute();
  }

  @Get('users/:userId/roles')
  findForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.findUserRolesUseCase.execute(userId);
  }

  @Post('users/:userId/roles')
  assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.assignRoleUseCase.execute(user.id, userId, dto);
  }

  @Delete('users/:userId/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.removeRoleUseCase.execute(user.id, userId, roleId);
  }
}
