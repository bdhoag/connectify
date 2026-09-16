import { Injectable } from '@nestjs/common';
import { UsersRepository, User } from './users.repository';

// TODO: flesh out with real endpoints (profile update, etc.) and DTOs.
// Kept as a thin example wiring Controller -> Service -> Repository -> Drizzle.
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findById(id);
  }
}
