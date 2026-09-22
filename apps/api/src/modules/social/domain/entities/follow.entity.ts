export class FollowEntity {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;

  constructor(props: {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.followerId = props.followerId;
    this.followingId = props.followingId;
    this.createdAt = props.createdAt;
  }
}
