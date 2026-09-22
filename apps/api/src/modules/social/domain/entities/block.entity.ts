export class BlockEntity {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;

  constructor(props: {
    id: string;
    blockerId: string;
    blockedId: string;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.blockerId = props.blockerId;
    this.blockedId = props.blockedId;
    this.createdAt = props.createdAt;
  }
}
