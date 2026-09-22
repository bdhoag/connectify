import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';

@Injectable()
export class DeleteMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  // TODO: enforce ownership (message.senderId === currentUser.id) once auth
  // guards/decorators exist.
  async execute(id: string): Promise<void> {
    const message = await this.messageRepository.softDelete(id);
    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
  }
}
