/**
 * ZIP Archive Utilities - BE-08
 *
 * Utilities for creating ZIP archives from multiple files.
 */

import archiver from 'archiver';
import { PassThrough } from 'stream';

export interface ZipFile {
  name: string;
  buffer: Buffer;
}

/**
 * Creates a ZIP archive from multiple files
 *
 * @param files - Array of files to include in the archive
 * @returns Buffer containing the ZIP archive
 */
export async function createZipArchive(files: ZipFile[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const passThrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 5 } });

    passThrough.on('data', (chunk) => chunks.push(chunk));
    passThrough.on('end', () => resolve(Buffer.concat(chunks)));
    passThrough.on('error', reject);

    archive.pipe(passThrough);
    archive.on('error', reject);

    for (const file of files) {
      archive.append(file.buffer, { name: file.name });
    }

    archive.finalize();
  });
}

/**
 * Generates a unique filename for a bulk download ZIP archive
 *
 * @returns Filename string in format: print-files-YYYY-MM-DD-timestamp.zip
 */
export function generateZipFileName(): string {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();
  return `print-files-${date}-${timestamp}.zip`;
}
