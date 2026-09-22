import { Inject, Injectable } from '@nestjs/common';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  execute(dto: CreateConversationDto): Promise<ConversationEntity> {
    return this.conversationRepository.create(dto.memberIds);
  }
}
