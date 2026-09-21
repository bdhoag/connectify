import { Inject, Injectable } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  execute(dto: CreatePostDto): Promise<PostEntity> {
    return this.postRepository.create(dto);
  }
}
