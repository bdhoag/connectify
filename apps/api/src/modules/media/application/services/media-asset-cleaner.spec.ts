import type { MediaStorage } from '../../domain/services/media-storage';
import { MediaAssetCleaner } from './media-asset-cleaner';

function makeStorage(deleteMany = jest.fn().mockResolvedValue(undefined)) {
  const storage: MediaStorage = {
    signUpload: jest.fn(),
    isOwnedUpload: jest.fn(),
    deleteMany,
  };
  return { storage, deleteMany };
}

describe('MediaAssetCleaner', () => {
  it('deletes every public id in one call', async () => {
    const { storage, deleteMany } = makeStorage();
    await new MediaAssetCleaner(storage).deleteAssets([
      { publicId: 'a' },
      { publicId: 'b' },
    ]);
    expect(deleteMany).toHaveBeenCalledWith(['a', 'b']);
  });

  it('does not call the provider when there is nothing to delete', async () => {
    const { storage, deleteMany } = makeStorage();
    await new MediaAssetCleaner(storage).deleteAssets([]);
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('swallows provider failures so the user’s delete still succeeds', async () => {
    const { storage } = makeStorage(
      jest.fn().mockRejectedValue(new Error('cloudinary down')),
    );
    const cleaner = new MediaAssetCleaner(storage);
    const logSpy = jest
      .spyOn(cleaner['logger'], 'error')
      .mockImplementation(() => undefined);

    await expect(
      cleaner.deleteAssets([{ publicId: 'a' }]),
    ).resolves.toBeUndefined();
    expect(logSpy).toHaveBeenCalled();
  });
});
