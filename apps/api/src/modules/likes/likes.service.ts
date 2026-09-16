import { Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';

// TODO: implement like/unlike endpoints and DTOs.
@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesRepository) {}
}
