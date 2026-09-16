import { Injectable } from '@nestjs/common';
import { PostsRepository, Post } from './posts.repository';

// TODO: implement create/get/update-own/delete-own with ownership checks and DTOs.
@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  findById(id: string): Promise<Post | undefined> {
    return this.postsRepository.findById(id);
  }
}
