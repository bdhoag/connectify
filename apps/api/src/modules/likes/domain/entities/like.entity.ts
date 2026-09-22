export class LikeEntity {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    postId: string;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.postId = props.postId;
    this.createdAt = props.createdAt;
  }
}
