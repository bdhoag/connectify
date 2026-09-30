import { Injectable } from '@nestjs/common';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { UserEntity } from '../../../users/domain/entities/user.entity';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  execute(userId: string): Promise<UserEntity> {
    return this.findUserByIdUseCase.execute(userId);
  }
}
