import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CursorPaginationQueryDto } from '../../../../common/dto/cursor-pagination-query.dto';
import { AddMemberDto } from '../../application/dto/add-member.dto';
import { CreateConversationDto } from '../../application/dto/create-conversation.dto';
import { QueryConversationDto } from '../../application/dto/query-conversation.dto';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { UpdateMessageDto } from '../../application/dto/update-message.dto';
import { AddMemberUseCase } from '../../application/use-cases/add-member.use-case';
import { CreateConversationUseCase } from '../../application/use-cases/create-conversation.use-case';
import { DeleteMessageUseCase } from '../../application/use-cases/delete-message.use-case';
import { FindConversationByIdUseCase } from '../../application/use-cases/find-conversation-by-id.use-case';
import { FindConversationsForUserUseCase } from '../../application/use-cases/find-conversations-for-user.use-case';
import { FindMessageByIdUseCase } from '../../application/use-cases/find-message-by-id.use-case';
import { FindMessagesUseCase } from '../../application/use-cases/find-messages.use-case';
import { RemoveMemberUseCase } from '../../application/use-cases/remove-member.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { UpdateMessageUseCase } from '../../application/use-cases/update-message.use-case';

@Controller()
export class MessagesController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly findConversationByIdUseCase: FindConversationByIdUseCase,
    private readonly findConversationsForUserUseCase: FindConversationsForUserUseCase,
    private readonly addMemberUseCase: AddMemberUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly findMessagesUseCase: FindMessagesUseCase,
    private readonly findMessageByIdUseCase: FindMessageByIdUseCase,
    private readonly updateMessageUseCase: UpdateMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase,
  ) {}

  @Post('conversations')
  createConversation(@Body() dto: CreateConversationDto) {
    return this.createConversationUseCase.execute(dto);
  }

  @Get('conversations')
  findConversations(@Query() query: QueryConversationDto) {
    return this.findConversationsForUserUseCase.execute(query);
  }

  @Get('conversations/:id')
  findConversation(@Param('id', ParseUUIDPipe) id: string) {
    return this.findConversationByIdUseCase.execute(id);
  }

  @Post('conversations/:id/members')
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.addMemberUseCase.execute(id, dto);
  }

  @Delete('conversations/:id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.removeMemberUseCase.execute(id, userId);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sendMessageUseCase.execute(id, dto);
  }

  @Get('conversations/:id/messages')
  findMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.findMessagesUseCase.execute(id, query);
  }

  @Get('messages/:id')
  findMessage(@Param('id', ParseUUIDPipe) id: string) {
    return this.findMessageByIdUseCase.execute(id);
  }

  @Patch('messages/:id')
  updateMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.updateMessageUseCase.execute(id, dto);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMessage(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteMessageUseCase.execute(id);
  }
}
