import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BLOCK_REPOSITORY } from '../../domain/repositories/block.repository';
import type { BlockRepository } from '../../domain/repositories/block.repository';
import { BlockUserDto } from '../dto/block-user.dto';

@Injectable()
export class UnblockUserUseCase {
  constructor(
    @Inject(BLOCK_REPOSITORY) private readonly blockRepository: BlockRepository,
  ) {}

  async execute(blockedId: string, dto: BlockUserDto): Promise<void> {
    const deleted = await this.blockRepository.delete(
      dto.blockerId,
      blockedId,
    );
    if (!deleted) {
      throw new NotFoundException(
        `User "${dto.blockerId}" is not blocking user "${blockedId}"`,
      );
    }
  }
}
