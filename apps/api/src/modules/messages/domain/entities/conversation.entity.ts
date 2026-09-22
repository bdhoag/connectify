export class ConversationEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: { id: string; createdAt: Date; updatedAt: Date }) {
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

export class ConversationMemberEntity {
  conversationId: string;
  userId: string;
  joinedAt: Date;
  leftAt: Date | null;

  constructor(props: {
    conversationId: string;
    userId: string;
    joinedAt: Date;
    leftAt: Date | null;
  }) {
    this.conversationId = props.conversationId;
    this.userId = props.userId;
    this.joinedAt = props.joinedAt;
    this.leftAt = props.leftAt;
  }
}
