import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryMediaStorage } from './cloudinary-media-storage';

const SECRET = 'test-secret';
const USER = 'user-1';

const config = new ConfigService({
  CLOUDINARY_CLOUD_NAME: 'demo',
  CLOUDINARY_API_KEY: 'key',
  CLOUDINARY_API_SECRET: SECRET,
});
const storage = new CloudinaryMediaStorage(config);

describe('CloudinaryMediaStorage.signUpload', () => {
  it('puts the user and folder in a server-chosen public_id', () => {
    const upload = storage.signUpload(USER, 'posts');
    expect(upload.publicId).toMatch(/^connectify\/posts\/user-1\/[\w-]+$/);
    expect(upload.uploadUrl).toBe(
      'https://api.cloudinary.com/v1_1/demo/image/upload',
    );
    expect(upload.apiKey).toBe('key');
  });

  it('signs exactly the params the client must send back', () => {
    const upload = storage.signUpload(USER, 'messages');
    const expected = cloudinary.utils.api_sign_request(
      {
        timestamp: upload.timestamp,
        public_id: upload.publicId,
        allowed_formats: upload.allowedFormats,
      },
      SECRET,
    );
    expect(upload.signature).toBe(expected);
  });

  it('never returns the api secret', () => {
    expect(JSON.stringify(storage.signUpload(USER, 'posts'))).not.toContain(
      SECRET,
    );
  });
});

describe('CloudinaryMediaStorage.isOwnedUpload', () => {
  const publicId = 'connectify/posts/user-1/abc';
  const url = `https://res.cloudinary.com/demo/image/upload/v1/${publicId}.jpg`;

  it('accepts the user’s own upload for that folder', () => {
    expect(storage.isOwnedUpload(USER, 'posts', { url, publicId })).toBe(true);
  });

  it('rejects another user’s asset', () => {
    expect(storage.isOwnedUpload('user-2', 'posts', { url, publicId })).toBe(
      false,
    );
  });

  it('rejects an asset from a different folder', () => {
    expect(storage.isOwnedUpload(USER, 'messages', { url, publicId })).toBe(
      false,
    );
  });

  it('rejects a URL on another cloud or host', () => {
    expect(
      storage.isOwnedUpload(USER, 'posts', {
        url: `https://res.cloudinary.com/other/image/upload/v1/${publicId}.jpg`,
        publicId,
      }),
    ).toBe(false);
    expect(
      storage.isOwnedUpload(USER, 'posts', {
        url: `https://evil.example/demo/image/upload/v1/${publicId}.jpg`,
        publicId,
      }),
    ).toBe(false);
  });

  it('rejects a URL that does not match the public_id', () => {
    expect(
      storage.isOwnedUpload(USER, 'posts', {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/connectify/posts/user-2/zzz.jpg',
        publicId,
      }),
    ).toBe(false);
  });

  it('rejects a malformed URL', () => {
    expect(
      storage.isOwnedUpload(USER, 'posts', { url: 'not a url', publicId }),
    ).toBe(false);
  });
});

describe('CloudinaryMediaStorage.deleteMany', () => {
  afterEach(() => jest.restoreAllMocks());

  it('deletes images and purges the CDN cache', async () => {
    const spy = jest
      .spyOn(cloudinary.api, 'delete_resources')
      .mockResolvedValue({});
    await storage.deleteMany(['a', 'b']);
    expect(spy).toHaveBeenCalledWith(['a', 'b'], {
      resource_type: 'image',
      type: 'upload',
      invalidate: true,
    });
  });

  it('splits more than 100 ids into batches', async () => {
    const spy = jest
      .spyOn(cloudinary.api, 'delete_resources')
      .mockResolvedValue({});
    const ids = Array.from({ length: 150 }, (_, i) => `id-${i}`);
    await storage.deleteMany(ids);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toHaveLength(100);
    expect(spy.mock.calls[1][0]).toHaveLength(50);
  });

  it('does nothing for an empty list', async () => {
    const spy = jest
      .spyOn(cloudinary.api, 'delete_resources')
      .mockResolvedValue({});
    await storage.deleteMany([]);
    expect(spy).not.toHaveBeenCalled();
  });
});
