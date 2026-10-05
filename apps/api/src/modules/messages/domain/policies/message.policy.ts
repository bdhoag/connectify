import { MessageEntity } from '../entities/message.entity';

// Message-level rules only cover authorship. Whether the user may touch the
// conversation at all is ConversationPolicy's job and must be checked first.
export class MessagePolicy {
  static canUpdate(userId: string, message: MessageEntity): boolean {
    return message.senderId === userId;
  }

  static canDelete(userId: string, message: MessageEntity): boolean {
    return message.senderId === userId;
  }
}
