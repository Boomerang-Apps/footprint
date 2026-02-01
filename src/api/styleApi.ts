import { Style, StylesResponse, StylesQuery } from '@/types/style';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class StyleApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string
  ) {
    super(message);
    this.name = 'StyleApiError';
  }
}

export class StyleApi {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new StyleApiError(
          'Network error',
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      throw new StyleApiError(
        errorData.error || 'API request failed',
        response.status,
        errorData.details
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new StyleApiError(
        'Failed to parse response',
        response.status,
        error instanceof Error ? error.message : 'Unknown parsing error'
      );
    }
  }

  /**
   * Fetch all styles from the API
   */
  static async getStyles(query?: Partial<StylesQuery>): Promise<Style[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (query?.limit) {
        searchParams.append('limit', query.limit.toString());
      }
      
      if (query?.offset) {
        searchParams.append('offset', query.offset.toString());
      }
      
      if (query?.search) {
        searchParams.append('search', query.search);
      }

      const url = `${API_BASE_URL}/api/styles${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache control for better performance
        cache: 'no-store', // Ensure fresh data for now, can be optimized later
      });

      const data = await this.handleResponse<StylesResponse>(response);

      if (!data.success || !data.data) {
        throw new StyleApiError(
          data.error || 'Failed to fetch styles',
          response.status,
          data.details
        );
      }

      return data.data;
    } catch (error) {
      if (error instanceof StyleApiError) {
        throw error;
      }

      // Handle network errors
      throw new StyleApiError(
        'Network request failed',
        0,
        error instanceof Error ? error.message : 'Unknown network error'
      );
    }
  }

  /**
   * Search styles by name
   */
  static async searchStyles(searchTerm: string, limit = 50): Promise<Style[]> {
    return this.getStyles({
      search: searchTerm,
      limit,
    });
  }

  /**
   * Get paginated styles
   */
  static async getStylesPaginated(
    page = 1,
    pageSize = 20
  ): Promise<Style[]> {
    const offset = (page - 1) * pageSize;
    return this.getStyles({
      limit: pageSize,
      offset,
    });
  }
}

// Export convenience functions
export const getStyles = StyleApi.getStyles.bind(StyleApi);
export const searchStyles = StyleApi.searchStyles.bind(StyleApi);
export const getStylesPaginated = StyleApi.getStylesPaginated.bind(StyleApi);
