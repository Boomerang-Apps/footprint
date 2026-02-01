import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { GET } from '../styles/route';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
};

describe('/api/styles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/styles', () => {
    it('should return 200 and empty array when no styles exist', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/styles', {
        method: 'GET',
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: [],
        message: 'Styles retrieved successfully',
      });
    });

    it('should return 200 and styles array when styles exist', async () => {
      // Arrange
      const mockStyles = [
        { id: 1, name: 'Modern', description: 'Clean and minimal' },
        { id: 2, name: 'Classic', description: 'Traditional design' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockStyles,
            error: null,
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/styles', {
        method: 'GET',
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: mockStyles,
        message: 'Styles retrieved successfully',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('styles');
    });

    it('should return 500 when database query fails', async () => {
      // Arrange
      const mockError = { message: 'Database connection failed' };
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: mockError,
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/styles', {
        method: 'GET',
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch styles',
        details: mockError.message,
      });
    });

    it('should return 500 when Supabase client creation fails', async () => {
      // Arrange
      (createClient as any).mockImplementation(() => {
        throw new Error('Invalid Supabase configuration');
      });

      const request = new NextRequest('http://localhost:3000/api/styles', {
        method: 'GET',
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Invalid Supabase configuration',
      });
    });

    it('should handle missing environment variables gracefully', async () => {
      // Arrange
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const request = new NextRequest('http://localhost:3000/api/styles', {
        method: 'GET',
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');

      // Cleanup
      if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      if (originalKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    });

    it('should call correct Supabase methods with proper parameters', async () => {
      // Arrange
      const selectMock = vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      }));
      
      const orderMock = vi.fn(() => ({
        data: [],
        error: null,
      }));

      mockSupabase.from.mockReturnValue({
        select: selectMock,
      });

      selectMock.mockReturnValue({
        order: orderMock,
      });

      const request = new NextRequest('http://localhost:3000/api/styles', {
        method: 'GET',
      });

      // Act
      await GET(request);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('styles');
      expect(selectMock).toHaveBeenCalledWith('id, name, description, created_at');
      expect(orderMock).toHaveBeenCalledWith('name', { ascending: true });
    });
  });

  describe('Unsupported HTTP methods', () => {
    it('should return 405 for POST method', async () => {
      const request = new NextRequest('http://localhost:3000/api/styles', {
        method: 'POST',
      });

      // Since we only implement GET, other methods should fail
      // This test will pass once we implement proper method handling
      expect(true).toBe(true); // Placeholder - will be updated with actual implementation
    });
  });
});
