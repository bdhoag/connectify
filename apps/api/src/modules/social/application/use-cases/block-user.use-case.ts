import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BlockEntity } from '../../domain/entities/block.entity';
import { BLOCK_REPOSITORY } from '../../domain/repositories/block.repository';
import type { BlockRepository } from '../../domain/repositories/block.repository';
import { BlockUserDto } from '../dto/block-user.dto';

@Injectable()
export class BlockUserUseCase {
  constructor(
    @Inject(BLOCK_REPOSITORY) private readonly blockRepository: BlockRepository,
  ) {}

  async execute(blockedId: string, dto: BlockUserDto): Promise<BlockEntity> {
    if (dto.blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }

    return this.blockRepository.create({
      blockerId: dto.blockerId,
      blockedId,
    });
  }
}
