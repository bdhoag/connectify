import { MediaAttachment } from '../../../media/domain/entities/media-attachment.entity';

export class PostEntity {
  id: string;
  authorId: string;
  content: string | null;
  media: MediaAttachment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(props: {
    id: string;
    authorId: string;
    content: string | null;
    media: MediaAttachment[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    this.id = props.id;
    this.authorId = props.authorId;
    this.content = props.content;
    this.media = props.media;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
