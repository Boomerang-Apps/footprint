import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStyles } from '../styleService';
import * as styleApi from '../api/styleApi';

vi.mock('../api/styleApi');

const mockStyleApi = vi.mocked(styleApi);

describe('styleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches styles from API', async () => {
    const mockStyles = [
      { id: '1', name: 'Test Style', description: 'Test description' }
    ];

    mockStyleApi.getStyles.mockResolvedValue(mockStyles);

    const result = await fetchStyles();

    expect(mockStyleApi.getStyles).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockStyles);
  });

  it('throws error when API call fails', async () => {
    mockStyleApi.getStyles.mockRejectedValue(new Error('API Error'));

    await expect(fetchStyles()).rejects.toThrow('API Error');
  });
});
