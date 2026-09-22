import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { UpdateMessageDto } from '../dto/update-message.dto';

@Injectable()
export class UpdateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  // TODO: enforce ownership (message.senderId === currentUser.id) once auth
  // guards/decorators exist.
  async execute(id: string, dto: UpdateMessageDto): Promise<MessageEntity> {
    const message = await this.messageRepository.update(id, dto);
    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
    return message;
  }
}
