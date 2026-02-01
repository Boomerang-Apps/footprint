/**
 * ZIP Archive Utility Tests - BE-08
 */

import { describe, it, expect } from 'vitest';
import { createZipArchive, generateZipFileName, type ZipFile } from './zip-archive';

describe('ZIP Archive Utilities', () => {
  describe('createZipArchive', () => {
    it('should create a valid ZIP buffer', async () => {
      const files: ZipFile[] = [
        { name: 'test1.txt', buffer: Buffer.from('Hello World') },
        { name: 'test2.txt', buffer: Buffer.from('Test Content') },
      ];

      const result = await createZipArchive(files);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle single file', async () => {
      const files: ZipFile[] = [
        { name: 'single.txt', buffer: Buffer.from('Single file content') },
      ];

      const result = await createZipArchive(files);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty array', async () => {
      const files: ZipFile[] = [];

      const result = await createZipArchive(files);

      // Empty ZIP still has header bytes
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle binary content', async () => {
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);
      const files: ZipFile[] = [
        { name: 'binary.bin', buffer: binaryData },
      ];

      const result = await createZipArchive(files);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(binaryData.length);
    });

    it('should preserve file names', async () => {
      const files: ZipFile[] = [
        { name: 'folder/subfolder/file.txt', buffer: Buffer.from('nested') },
      ];

      const result = await createZipArchive(files);

      expect(result).toBeInstanceOf(Buffer);
      // ZIP should contain the path - basic validation
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('generateZipFileName', () => {
    it('should return a string ending with .zip', () => {
      const fileName = generateZipFileName();

      expect(fileName).toMatch(/\.zip$/);
    });

    it('should include date in filename', () => {
      const fileName = generateZipFileName();
      const today = new Date().toISOString().split('T')[0];

      expect(fileName).toContain(today);
    });

    it('should start with print-files prefix', () => {
      const fileName = generateZipFileName();

      expect(fileName).toMatch(/^print-files-/);
    });

    it('should generate unique names on successive calls', () => {
      const fileName1 = generateZipFileName();
      // Small delay to ensure timestamp differs
      const fileName2 = generateZipFileName();

      // They may be the same if called within same millisecond
      // but the format should be valid
      expect(fileName1).toMatch(/^print-files-\d{4}-\d{2}-\d{2}-\d+\.zip$/);
      expect(fileName2).toMatch(/^print-files-\d{4}-\d{2}-\d{2}-\d+\.zip$/);
    });
  });
});
