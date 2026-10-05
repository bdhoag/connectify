import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BLOCK_REPOSITORY } from '../../domain/repositories/block.repository';
import type { BlockRepository } from '../../domain/repositories/block.repository';

@Injectable()
export class UnblockUserUseCase {
  constructor(
    @Inject(BLOCK_REPOSITORY) private readonly blockRepository: BlockRepository,
  ) {}

  async execute(blockerId: string, blockedId: string): Promise<void> {
    const deleted = await this.blockRepository.delete(blockerId, blockedId);
    if (!deleted) {
      throw new NotFoundException(`You are not blocking user "${blockedId}"`);
    }
  }
}
