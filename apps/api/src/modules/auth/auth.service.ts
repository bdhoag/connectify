import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';

// TODO: implement register/login/refresh/logout (JWT issuing, password
// hashing, refresh token rotation) against AuthRepository.
@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}
}
