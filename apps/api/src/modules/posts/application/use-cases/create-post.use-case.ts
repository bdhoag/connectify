import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import { POST_REPOSITORY } from '../../domain/repositories/post.repository';
import type { PostRepository } from '../../domain/repositories/post.repository';
import { MediaAttachmentValidator } from '../../../media/application/services/media-attachment-validator';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
    private readonly mediaValidator: MediaAttachmentValidator,
  ) {}

  async execute(userId: string, dto: CreatePostDto): Promise<PostEntity> {
    const media = dto.media ?? [];
    // Whitespace-only text counts as no text.
    const content = dto.content?.trim() ? dto.content : null;
    if (!content && media.length === 0) {
      throw new BadRequestException('A post needs content or media');
    }
    this.mediaValidator.assertOwned(userId, 'posts', media);

    return this.postRepository.create({
      authorId: userId,
      content,
      media,
    });
  }
}
