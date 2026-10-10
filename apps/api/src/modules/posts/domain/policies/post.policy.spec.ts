import { PostEntity } from '../entities/post.entity';
import { PostPolicy } from './post.policy';

const post = new PostEntity({
  id: 'post-1',
  authorId: 'author',
  content: 'hello',
  media: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe('PostPolicy', () => {
  it('lets the author update and delete', () => {
    expect(PostPolicy.canUpdate('author', post)).toBe(true);
    expect(PostPolicy.canDelete('author', post)).toBe(true);
  });

  it('denies everyone else', () => {
    expect(PostPolicy.canUpdate('someone-else', post)).toBe(false);
    expect(PostPolicy.canDelete('someone-else', post)).toBe(false);
  });
});
