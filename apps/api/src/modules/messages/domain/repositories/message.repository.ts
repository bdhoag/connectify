import { MessageEntity } from '../entities/message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  content: string;
}

export interface UpdateMessageData {
  content?: string;
}

export interface FindMessagesParams {
  conversationId: string;
  cursor?: Date;
  limit: number;
}

export interface FindMessagesResult {
  items: MessageEntity[];
  nextCursor: string | null;
}

export interface MessageRepository {
  create(data: CreateMessageData): Promise<MessageEntity>;
  findById(id: string): Promise<MessageEntity | null>;
  findByConversation(params: FindMessagesParams): Promise<FindMessagesResult>;
  update(id: string, data: UpdateMessageData): Promise<MessageEntity | null>;
  softDelete(id: string): Promise<MessageEntity | null>;
}
