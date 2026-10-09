import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AddMemberUseCase } from './application/use-cases/add-member.use-case';
import { ConversationAuthorizer } from './application/services/conversation-authorizer';
import { CreateConversationUseCase } from './application/use-cases/create-conversation.use-case';
import { DeleteMessageUseCase } from './application/use-cases/delete-message.use-case';
import { FindConversationByIdUseCase } from './application/use-cases/find-conversation-by-id.use-case';
import { FindConversationsForUserUseCase } from './application/use-cases/find-conversations-for-user.use-case';
import { FindMessageByIdUseCase } from './application/use-cases/find-message-by-id.use-case';
import { FindMessagesUseCase } from './application/use-cases/find-messages.use-case';
import { RemoveMemberUseCase } from './application/use-cases/remove-member.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { UpdateMessageUseCase } from './application/use-cases/update-message.use-case';
import { CONVERSATION_REPOSITORY } from './domain/repositories/conversation.repository';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { DrizzleConversationRepository } from './infrastructure/repositories/drizzle-conversation.repository';
import { DrizzleMessageRepository } from './infrastructure/repositories/drizzle-message.repository';
import { MessagesController } from './presentation/controllers/messages.controller';

@Module({
  imports: [MediaModule],
  controllers: [MessagesController],
  providers: [
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: DrizzleConversationRepository,
    },
    { provide: MESSAGE_REPOSITORY, useClass: DrizzleMessageRepository },
    ConversationAuthorizer,
    CreateConversationUseCase,
    FindConversationByIdUseCase,
    FindConversationsForUserUseCase,
    AddMemberUseCase,
    RemoveMemberUseCase,
    SendMessageUseCase,
    FindMessagesUseCase,
    FindMessageByIdUseCase,
    UpdateMessageUseCase,
    DeleteMessageUseCase,
  ],
  exports: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
})
export class MessagesModule {}
