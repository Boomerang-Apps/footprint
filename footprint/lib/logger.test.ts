import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('serializeError - production', () => {
    it('should exclude stack in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { logger } = await import('./logger');
      const error = new Error('test error');
      error.stack = 'Error: test error\n    at Object.<anonymous> (/src/lib/logger.ts:10:15)';

      logger.error('something failed', error);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('test error');
      expect(output).toContain('Error'); // error.name
      expect(output).not.toContain('/src/lib/logger.ts'); // no file paths leaked
      expect(output).not.toContain('at Object');

      consoleSpy.mockRestore();
    });
  });

  describe('serializeError - development', () => {
    it('should include stack in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { logger } = await import('./logger');
      const error = new Error('dev error');

      logger.error('something failed', error);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('dev error');
      expect(output).toContain('stack');

      consoleSpy.mockRestore();
    });
  });

  describe('serializeError - test (non-production)', () => {
    it('should include stack in test environment', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { logger } = await import('./logger');
      const error = new Error('test env error');

      logger.error('something failed', error);

      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('stack');

      consoleSpy.mockRestore();
    });
  });

  describe('serializeError - includes name', () => {
    it('should include error name', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { logger } = await import('./logger');
      const error = new TypeError('bad type');

      logger.error('type issue', error);

      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('TypeError');
      expect(output).toContain('bad type');

      consoleSpy.mockRestore();
    });
  });
});
