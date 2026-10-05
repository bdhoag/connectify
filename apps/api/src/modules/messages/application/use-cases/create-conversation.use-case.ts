import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

  async execute(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationEntity> {
    // The creator is always a member; Set drops them if they listed themselves.
    const memberIds = [...new Set([userId, ...dto.memberIds])];
    if (memberIds.length < 2) {
      throw new BadRequestException(
        'A conversation needs at least 1 other member',
      );
    }

    return this.conversationRepository.create(memberIds);
  }
}
