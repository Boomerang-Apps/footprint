import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Replicate SDK before imports
const mockRun = vi.fn();

vi.mock('replicate', () => {
  return {
    default: class MockReplicate {
      run = mockRun;
      constructor() {}
    },
  };
});

// Import after mocking
import {
  StyleType,
  STYLE_PROMPTS,
  ALLOWED_STYLES,
  isValidStyle,
  transformImage,
  transformWithRetry,
  getStylePrompt,
} from './replicate';

describe('lib/ai/replicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('REPLICATE_API_TOKEN', 'test-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('STYLE_PROMPTS', () => {
    it('should have prompts for all 5 styles', () => {
      expect(Object.keys(STYLE_PROMPTS)).toHaveLength(5);
    });

    it('should include original style', () => {
      expect(STYLE_PROMPTS.original).toContain('original');
    });

    it('should include watercolor style', () => {
      expect(STYLE_PROMPTS.watercolor).toContain('watercolor');
    });

    it('should include line_art style', () => {
      expect(STYLE_PROMPTS.line_art).toContain('line art');
    });

    it('should include line_art_watercolor style', () => {
      expect(STYLE_PROMPTS.line_art_watercolor).toContain('line art');
      expect(STYLE_PROMPTS.line_art_watercolor).toContain('watercolor');
    });

    it('should include pop_art style', () => {
      expect(STYLE_PROMPTS.pop_art).toContain('Pop Art');
    });
  });

  describe('ALLOWED_STYLES', () => {
    it('should contain all 5 style types', () => {
      expect(ALLOWED_STYLES).toHaveLength(5);
      expect(ALLOWED_STYLES).toContain('original');
      expect(ALLOWED_STYLES).toContain('watercolor');
      expect(ALLOWED_STYLES).toContain('line_art');
      expect(ALLOWED_STYLES).toContain('line_art_watercolor');
      expect(ALLOWED_STYLES).toContain('pop_art');
    });
  });

  describe('isValidStyle', () => {
    it('should return true for valid styles', () => {
      expect(isValidStyle('original')).toBe(true);
      expect(isValidStyle('watercolor')).toBe(true);
      expect(isValidStyle('line_art')).toBe(true);
      expect(isValidStyle('line_art_watercolor')).toBe(true);
      expect(isValidStyle('pop_art')).toBe(true);
    });

    it('should return false for invalid styles', () => {
      expect(isValidStyle('invalid_style')).toBe(false);
      expect(isValidStyle('')).toBe(false);
      expect(isValidStyle('POP_ART')).toBe(false); // Case sensitive
      expect(isValidStyle(null as unknown as string)).toBe(false);
      expect(isValidStyle(undefined as unknown as string)).toBe(false);
    });

    it('should return false for non-existent styles', () => {
      expect(isValidStyle('comic_book')).toBe(false);
      expect(isValidStyle('sketch')).toBe(false);
      expect(isValidStyle('pencil')).toBe(false);
    });
  });

  describe('getStylePrompt', () => {
    it('should return correct prompt for each style', () => {
      const styles: StyleType[] = [
        'original',
        'watercolor',
        'line_art',
        'line_art_watercolor',
        'pop_art',
      ];

      styles.forEach((style) => {
        const prompt = getStylePrompt(style);
        expect(prompt).toBe(STYLE_PROMPTS[style]);
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(10);
      });
    });

    it('should throw error for invalid style', () => {
      expect(() => getStylePrompt('invalid' as StyleType)).toThrow('Invalid style');
    });
  });

  describe('transformImage', () => {
    const testImageUrl = 'https://images.footprint.co.il/uploads/user123/photo.jpg';
    const mockOutputUrl = 'https://replicate.delivery/output/transformed.png';

    it('should call Replicate API with correct parameters', async () => {
      mockRun.mockResolvedValue(mockOutputUrl);

      await transformImage(testImageUrl, 'pop_art');

      expect(mockRun).toHaveBeenCalledWith(
        'black-forest-labs/flux-kontext-pro',
        expect.objectContaining({
          input: expect.objectContaining({
            image: testImageUrl,
            prompt: expect.stringContaining('Pop Art'),
          }),
        })
      );
    });

    it('should return output URL as string when API returns string', async () => {
      mockRun.mockResolvedValue(mockOutputUrl);

      const result = await transformImage(testImageUrl, 'watercolor');

      expect(result).toBe(mockOutputUrl);
    });

    it('should return first URL when API returns array', async () => {
      mockRun.mockResolvedValue([mockOutputUrl, 'https://another-url.com']);

      const result = await transformImage(testImageUrl, 'line_art');

      expect(result).toBe(mockOutputUrl);
    });

    it('should use correct model', async () => {
      mockRun.mockResolvedValue(mockOutputUrl);

      await transformImage(testImageUrl, 'watercolor');

      expect(mockRun).toHaveBeenCalledWith(
        'black-forest-labs/flux-kontext-pro',
        expect.any(Object)
      );
    });

    it('should include required input parameters', async () => {
      mockRun.mockResolvedValue(mockOutputUrl);

      await transformImage(testImageUrl, 'line_art_watercolor');

      expect(mockRun).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            image: testImageUrl,
            prompt: expect.any(String),
            guidance_scale: expect.any(Number),
            num_inference_steps: expect.any(Number),
            output_format: 'png',
            output_quality: 100,
          }),
        })
      );
    });

    it('should throw error when API fails', async () => {
      mockRun.mockRejectedValue(new Error('API Error'));

      await expect(transformImage(testImageUrl, 'pop_art')).rejects.toThrow('API Error');
    });

    it('should throw error when API returns null', async () => {
      mockRun.mockResolvedValue(null);

      await expect(transformImage(testImageUrl, 'watercolor')).rejects.toThrow(
        'No output returned from Replicate'
      );
    });

    it('should throw error when API returns empty array', async () => {
      mockRun.mockResolvedValue([]);

      await expect(transformImage(testImageUrl, 'original')).rejects.toThrow(
        'No output returned from Replicate'
      );
    });

    it('should throw error for missing API token', async () => {
      vi.stubEnv('REPLICATE_API_TOKEN', '');

      await expect(transformImage(testImageUrl, 'pop_art')).rejects.toThrow(
        'REPLICATE_API_TOKEN is not configured'
      );
    });
  });

  describe('transformWithRetry', () => {
    const testImageUrl = 'https://images.footprint.co.il/uploads/user123/photo.jpg';
    const mockOutputUrl = 'https://replicate.delivery/output/transformed.png';

    it('should return result on first successful attempt', async () => {
      mockRun.mockResolvedValue(mockOutputUrl);

      const result = await transformWithRetry(testImageUrl, 'pop_art', 1);

      expect(result).toBe(mockOutputUrl);
      expect(mockRun).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      mockRun
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValue(mockOutputUrl);

      // Use a patched delay for fast testing
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        (fn as () => void)();
        return 0 as unknown as NodeJS.Timeout;
      });

      const result = await transformWithRetry(testImageUrl, 'watercolor');

      expect(result).toBe(mockOutputUrl);
      expect(mockRun).toHaveBeenCalledTimes(2);

      vi.restoreAllMocks();
    });

    it('should retry up to 3 times by default', async () => {
      mockRun.mockRejectedValue(new Error('Persistent error'));

      // Skip delay in tests
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        (fn as () => void)();
        return 0 as unknown as NodeJS.Timeout;
      });

      await expect(transformWithRetry(testImageUrl, 'line_art')).rejects.toThrow(
        'Persistent error'
      );

      expect(mockRun).toHaveBeenCalledTimes(3);

      vi.restoreAllMocks();
    });

    it('should respect custom maxRetries parameter', async () => {
      mockRun.mockRejectedValue(new Error('Persistent error'));

      // Skip delay in tests
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        (fn as () => void)();
        return 0 as unknown as NodeJS.Timeout;
      });

      await expect(
        transformWithRetry(testImageUrl, 'watercolor', 5)
      ).rejects.toThrow('Persistent error');

      expect(mockRun).toHaveBeenCalledTimes(5);

      vi.restoreAllMocks();
    });

    it('should use exponential backoff between retries', async () => {
      const delays: number[] = [];

      vi.spyOn(global, 'setTimeout').mockImplementation((fn, ms) => {
        if (ms && ms > 0) delays.push(ms);
        (fn as () => void)();
        return 0 as unknown as NodeJS.Timeout;
      });

      mockRun
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValue(mockOutputUrl);

      await transformWithRetry(testImageUrl, 'line_art_watercolor');

      // Should have delays of 1000ms, 2000ms (exponential backoff)
      expect(delays[0]).toBe(1000);
      expect(delays[1]).toBe(2000);

      vi.restoreAllMocks();
    });

    it('should throw last error after all retries fail', async () => {
      mockRun
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Final error'));

      // Skip delay in tests
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        (fn as () => void)();
        return 0 as unknown as NodeJS.Timeout;
      });

      await expect(transformWithRetry(testImageUrl, 'pop_art')).rejects.toThrow(
        'Final error'
      );

      vi.restoreAllMocks();
    });
  });

  describe('Style type safety', () => {
    it('should have StyleType as a union of all style strings', () => {
      // TypeScript compile-time check - if this compiles, the types are correct
      const styles: StyleType[] = [
        'original',
        'watercolor',
        'line_art',
        'line_art_watercolor',
        'pop_art',
      ];

      expect(styles).toHaveLength(5);
    });
  });
});
