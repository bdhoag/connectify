import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaAssetCleaner } from '../../../media/application/services/media-asset-cleaner';
import { PostPolicy } from '../../domain/policies/post.policy';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
    private readonly mediaCleaner: MediaAssetCleaner,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    if (!PostPolicy.canDelete(userId, post)) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    const deleted = await this.postRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    // Only after the post is gone from the database.
    await this.mediaCleaner.deleteAssets(deleted.media);
  }
}
