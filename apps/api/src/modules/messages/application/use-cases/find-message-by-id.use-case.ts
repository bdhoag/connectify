import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';

@Injectable()
export class FindMessageByIdUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(id: string): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
    return message;
  }
}
