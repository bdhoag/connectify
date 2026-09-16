import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';

// TODO: implement create conversation/add member/send message endpoints and DTOs.
@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}
}
