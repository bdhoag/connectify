import { MediaAttachment } from '../../../media/domain/entities/media-attachment.entity';

export class MessageEntity {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  media: MediaAttachment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(props: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    media: MediaAttachment[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.content = props.content;
    this.media = props.media;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
