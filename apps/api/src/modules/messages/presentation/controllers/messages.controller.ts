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
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CursorPaginationQueryDto } from '../../../../common/dto/cursor-pagination-query.dto';
import { AddMemberDto } from '../../application/dto/add-member.dto';
import { CreateConversationDto } from '../../application/dto/create-conversation.dto';
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
  createConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.createConversationUseCase.execute(user.id, dto);
  }

  @Get('conversations')
  findConversations(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.findConversationsForUserUseCase.execute(user.id, query);
  }

  @Get('conversations/:id')
  findConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.findConversationByIdUseCase.execute(user.id, id);
  }

  @Post('conversations/:id/members')
  addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.addMemberUseCase.execute(user.id, id, dto);
  }

  @Delete('conversations/:id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.removeMemberUseCase.execute(user.id, id, userId);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sendMessageUseCase.execute(user.id, id, dto);
  }

  @Get('conversations/:id/messages')
  findMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.findMessagesUseCase.execute(user.id, id, query);
  }

  @Get('messages/:id')
  findMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.findMessageByIdUseCase.execute(user.id, id);
  }

  @Patch('messages/:id')
  updateMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.updateMessageUseCase.execute(user.id, id, dto);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteMessageUseCase.execute(user.id, id);
  }
}
