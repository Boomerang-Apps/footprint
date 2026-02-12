import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateImageKey,
  uploadToSupabase,
  getUploadUrl,
  deleteFromSupabase,
  getPublicUrl,
  getImageFromSupabase,
  type StorageFolder,
} from './supabase-storage';

// Mock storage bucket methods
const mockUpload = vi.fn();
const mockCreateSignedUploadUrl = vi.fn();
const mockRemove = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockDownload = vi.fn();

const mockFrom = vi.fn(() => ({
  upload: mockUpload,
  createSignedUploadUrl: mockCreateSignedUploadUrl,
  remove: mockRemove,
  getPublicUrl: mockGetPublicUrl,
  download: mockDownload,
}));

const mockSupabaseClient = {
  storage: {
    from: mockFrom,
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock crypto.randomUUID for deterministic keys
const MOCK_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
vi.stubGlobal('crypto', {
  ...crypto,
  randomUUID: vi.fn(() => MOCK_UUID),
});

describe('Supabase Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    // Default success responses
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/images/test-key' },
    });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  describe('generateImageKey', () => {
    it('should generate a key with correct folder, userId, timestamp, uuid, and extension', () => {
      const now = Date.now();
      const key = generateImageKey('user123', 'photo.jpg', 'uploads');

      expect(key).toMatch(/^uploads\/user123\/\d+-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee\.jpg$/);

      const timestampMatch = key.match(/\/(\d+)-/);
      expect(timestampMatch).not.toBeNull();
      const timestamp = parseInt(timestampMatch![1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(now - 1000);
      expect(timestamp).toBeLessThanOrEqual(now + 1000);
    });

    it('should generate key for each storage folder type', () => {
      const folders: StorageFolder[] = ['uploads', 'transformed', 'print-ready', 'thumbnails', 'bulk-downloads'];

      for (const folder of folders) {
        const key = generateImageKey('user1', 'file.png', folder);
        expect(key).toContain(`${folder}/user1/`);
      }
    });

    it('should preserve file extension in lowercase', () => {
      const jpgKey = generateImageKey('user1', 'photo.JPG', 'uploads');
      const pngKey = generateImageKey('user1', 'photo.PNG', 'uploads');
      const heicKey = generateImageKey('user1', 'photo.HEIC', 'uploads');

      expect(jpgKey).toMatch(/\.jpg$/);
      expect(pngKey).toMatch(/\.png$/);
      expect(heicKey).toMatch(/\.heic$/);
    });

    it('should use last segment as extension when no dot present', () => {
      // When there's no dot, split('.').pop() returns the whole filename
      const key = generateImageKey('user1', 'noextension', 'uploads');
      expect(key).toMatch(/\.noextension$/);
    });

    it('should default to jpg when split produces empty extension', () => {
      // When fileName ends with a dot, pop() returns '' which is falsy
      const key = generateImageKey('user1', 'photo.', 'uploads');
      expect(key).toMatch(/\.jpg$/);
    });

    it('should handle filenames with multiple dots', () => {
      const key = generateImageKey('user1', 'my.photo.final.png', 'uploads');
      expect(key).toMatch(/\.png$/);
    });

    it('should use crypto.randomUUID for unique segment', () => {
      generateImageKey('user1', 'photo.jpg', 'uploads');
      expect(crypto.randomUUID).toHaveBeenCalled();
    });
  });

  describe('uploadToSupabase', () => {
    it('should upload buffer and return key, publicUrl, and size', async () => {
      const buffer = Buffer.from('test image data');
      mockUpload.mockResolvedValue({
        data: { path: 'uploads/user123/1234-uuid.jpg' },
        error: null,
      });

      const result = await uploadToSupabase(
        buffer,
        'user123',
        'photo.jpg',
        'image/jpeg'
      );

      expect(result.key).toBe('uploads/user123/1234-uuid.jpg');
      expect(result.publicUrl).toBe(
        'https://test.supabase.co/storage/v1/object/public/images/test-key'
      );
      expect(result.size).toBe(buffer.length);
    });

    it('should call storage.from with "images" bucket', async () => {
      const buffer = Buffer.from('data');
      mockUpload.mockResolvedValue({
        data: { path: 'uploads/user1/key.jpg' },
        error: null,
      });

      await uploadToSupabase(buffer, 'user1', 'photo.jpg', 'image/jpeg');

      expect(mockFrom).toHaveBeenCalledWith('images');
    });

    it('should pass contentType and upsert: false to upload', async () => {
      const buffer = Buffer.from('data');
      mockUpload.mockResolvedValue({
        data: { path: 'uploads/user1/key.png' },
        error: null,
      });

      await uploadToSupabase(buffer, 'user1', 'photo.png', 'image/png');

      expect(mockUpload).toHaveBeenCalledWith(
        expect.any(String),
        buffer,
        { contentType: 'image/png', upsert: false }
      );
    });

    it('should default folder to "uploads"', async () => {
      const buffer = Buffer.from('data');
      mockUpload.mockResolvedValue({
        data: { path: 'uploads/user1/key.jpg' },
        error: null,
      });

      await uploadToSupabase(buffer, 'user1', 'photo.jpg', 'image/jpeg');

      const uploadedKey = mockUpload.mock.calls[0][0] as string;
      expect(uploadedKey).toMatch(/^uploads\//);
    });

    it('should use specified folder', async () => {
      const buffer = Buffer.from('data');
      mockUpload.mockResolvedValue({
        data: { path: 'transformed/user1/key.jpg' },
        error: null,
      });

      await uploadToSupabase(buffer, 'user1', 'photo.jpg', 'image/jpeg', 'transformed');

      const uploadedKey = mockUpload.mock.calls[0][0] as string;
      expect(uploadedKey).toMatch(/^transformed\//);
    });

    it('should throw when upload returns an error', async () => {
      const buffer = Buffer.from('data');
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      await expect(
        uploadToSupabase(buffer, 'user1', 'photo.jpg', 'image/jpeg')
      ).rejects.toThrow('Failed to upload to Supabase: Bucket not found');
    });

    it('should call getPublicUrl after successful upload', async () => {
      const buffer = Buffer.from('data');
      mockUpload.mockResolvedValue({
        data: { path: 'uploads/user1/key.jpg' },
        error: null,
      });

      await uploadToSupabase(buffer, 'user1', 'photo.jpg', 'image/jpeg');

      // getPublicUrl is called on the second .from('images') call
      expect(mockGetPublicUrl).toHaveBeenCalled();
    });
  });

  describe('getUploadUrl', () => {
    it('should return uploadUrl, key, publicUrl, and expiresIn', async () => {
      mockCreateSignedUploadUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.supabase.co/storage/v1/upload/sign/images/key?token=abc' },
        error: null,
      });

      const result = await getUploadUrl('user123', 'photo.jpg', 'image/jpeg');

      expect(result.uploadUrl).toBe(
        'https://test.supabase.co/storage/v1/upload/sign/images/key?token=abc'
      );
      expect(result.key).toMatch(/^uploads\/user123\/\d+-/);
      expect(result.publicUrl).toBe(
        'https://test.supabase.co/storage/v1/object/public/images/test-key'
      );
      expect(result.expiresIn).toBe(3600);
    });

    it('should default folder to "uploads"', async () => {
      mockCreateSignedUploadUrl.mockResolvedValue({
        data: { signedUrl: 'https://signed-url.example.com' },
        error: null,
      });

      const result = await getUploadUrl('user1', 'photo.jpg', 'image/jpeg');

      expect(result.key).toMatch(/^uploads\//);
    });

    it('should use specified folder', async () => {
      mockCreateSignedUploadUrl.mockResolvedValue({
        data: { signedUrl: 'https://signed-url.example.com' },
        error: null,
      });

      const result = await getUploadUrl('user1', 'photo.jpg', 'image/jpeg', 'transformed');

      expect(result.key).toMatch(/^transformed\//);
    });

    it('should call createSignedUploadUrl with the generated key', async () => {
      mockCreateSignedUploadUrl.mockResolvedValue({
        data: { signedUrl: 'https://signed-url.example.com' },
        error: null,
      });

      const result = await getUploadUrl('user1', 'photo.jpg', 'image/jpeg');

      expect(mockCreateSignedUploadUrl).toHaveBeenCalledWith(result.key);
    });

    it('should throw when createSignedUploadUrl returns an error', async () => {
      mockCreateSignedUploadUrl.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(
        getUploadUrl('user1', 'photo.jpg', 'image/jpeg')
      ).rejects.toThrow('Failed to create upload URL: Permission denied');
    });

    it('should call storage.from with "images" bucket', async () => {
      mockCreateSignedUploadUrl.mockResolvedValue({
        data: { signedUrl: 'https://signed-url.example.com' },
        error: null,
      });

      await getUploadUrl('user1', 'photo.jpg', 'image/jpeg');

      expect(mockFrom).toHaveBeenCalledWith('images');
    });
  });

  describe('deleteFromSupabase', () => {
    it('should delete a file by key', async () => {
      mockRemove.mockResolvedValue({ data: [{}], error: null });

      await expect(
        deleteFromSupabase('uploads/user123/1234-uuid.jpg')
      ).resolves.not.toThrow();

      expect(mockRemove).toHaveBeenCalledWith(['uploads/user123/1234-uuid.jpg']);
    });

    it('should call storage.from with "images" bucket', async () => {
      mockRemove.mockResolvedValue({ data: [{}], error: null });

      await deleteFromSupabase('uploads/user1/key.jpg');

      expect(mockFrom).toHaveBeenCalledWith('images');
    });

    it('should throw when remove returns an error', async () => {
      mockRemove.mockResolvedValue({
        data: null,
        error: { message: 'Object not found' },
      });

      await expect(
        deleteFromSupabase('uploads/user1/nonexistent.jpg')
      ).rejects.toThrow('Failed to delete from Supabase: Object not found');
    });

    it('should resolve successfully when deletion succeeds', async () => {
      mockRemove.mockResolvedValue({ data: [{}], error: null });

      const result = await deleteFromSupabase('uploads/user1/key.jpg');
      expect(result).toBeUndefined();
    });
  });

  describe('getPublicUrl', () => {
    it('should return the public URL for a key', () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/images/uploads/user1/key.jpg' },
      });

      const url = getPublicUrl('uploads/user1/key.jpg');

      expect(url).toBe(
        'https://test.supabase.co/storage/v1/object/public/images/uploads/user1/key.jpg'
      );
    });

    it('should call storage.from with "images" bucket', () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/images/key' },
      });

      getPublicUrl('some/key.jpg');

      expect(mockFrom).toHaveBeenCalledWith('images');
    });

    it('should call getPublicUrl with the provided key', () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/images/my/key.png' },
      });

      getPublicUrl('my/key.png');

      expect(mockGetPublicUrl).toHaveBeenCalledWith('my/key.png');
    });

    it('should handle different folder paths', () => {
      const folders = ['uploads', 'transformed', 'print-ready', 'thumbnails'];

      for (const folder of folders) {
        const key = `${folder}/user1/image.jpg`;
        mockGetPublicUrl.mockReturnValue({
          data: { publicUrl: `https://test.supabase.co/storage/v1/object/public/images/${key}` },
        });

        const url = getPublicUrl(key);
        expect(url).toContain(folder);
      }
    });
  });

  describe('getImageFromSupabase', () => {
    it('should download a file and return a Buffer', async () => {
      const imageData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG header bytes
      const mockBlob = {
        arrayBuffer: vi.fn().mockResolvedValue(imageData.buffer),
      };
      mockDownload.mockResolvedValue({ data: mockBlob, error: null });

      const result = await getImageFromSupabase('uploads/user1/image.png');

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(imageData.length);
      expect(result[0]).toBe(0x89);
      expect(result[1]).toBe(0x50);
    });

    it('should call storage.from with "images" bucket', async () => {
      const mockBlob = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(3)),
      };
      mockDownload.mockResolvedValue({ data: mockBlob, error: null });

      await getImageFromSupabase('uploads/user1/image.jpg');

      expect(mockFrom).toHaveBeenCalledWith('images');
    });

    it('should call download with the provided key', async () => {
      const mockBlob = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(3)),
      };
      mockDownload.mockResolvedValue({ data: mockBlob, error: null });

      await getImageFromSupabase('transformed/user1/styled.jpg');

      expect(mockDownload).toHaveBeenCalledWith('transformed/user1/styled.jpg');
    });

    it('should throw when download returns an error', async () => {
      mockDownload.mockResolvedValue({
        data: null,
        error: { message: 'File not found' },
      });

      await expect(
        getImageFromSupabase('uploads/user1/missing.jpg')
      ).rejects.toThrow('Failed to download from Supabase: File not found');
    });

    it('should correctly convert arrayBuffer data to Buffer', async () => {
      const testString = 'Hello, Supabase Storage!';
      const encoder = new TextEncoder();
      const encoded = encoder.encode(testString);
      const mockBlob = {
        arrayBuffer: vi.fn().mockResolvedValue(encoded.buffer),
      };
      mockDownload.mockResolvedValue({ data: mockBlob, error: null });

      const result = await getImageFromSupabase('uploads/user1/test.txt');

      expect(result.toString('utf-8')).toBe(testString);
    });
  });

  describe('getSupabaseClient (via exported functions)', () => {
    it('should throw when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      expect(() => getPublicUrl('any-key')).toThrow('Missing Supabase configuration');
    });

    it('should throw when both key env vars are missing', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => getPublicUrl('any-key')).toThrow('Missing Supabase configuration');
    });

    it('should fall back to NEXT_PUBLIC_SUPABASE_ANON_KEY when service role key is absent', async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/images/key' },
      });

      // Should not throw; the anon key is used instead
      const url = getPublicUrl('some/key.jpg');
      expect(url).toBeDefined();
    });

    it('should throw for async functions when env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      await expect(
        deleteFromSupabase('any-key')
      ).rejects.toThrow('Missing Supabase configuration');
    });

    it('should throw for uploadToSupabase when env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      await expect(
        uploadToSupabase(Buffer.from('data'), 'user1', 'photo.jpg', 'image/jpeg')
      ).rejects.toThrow('Missing Supabase configuration');
    });

    it('should throw for getUploadUrl when env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      await expect(
        getUploadUrl('user1', 'photo.jpg', 'image/jpeg')
      ).rejects.toThrow('Missing Supabase configuration');
    });

    it('should throw for getImageFromSupabase when env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      await expect(
        getImageFromSupabase('any-key')
      ).rejects.toThrow('Missing Supabase configuration');
    });
  });
});
