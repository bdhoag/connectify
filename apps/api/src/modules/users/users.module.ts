import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { DrizzleUserRepository } from './infrastructure/repositories/drizzle-user.repository';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
